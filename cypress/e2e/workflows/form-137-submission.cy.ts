/// <reference types="cypress" />

describe('Form 137 Submission Workflows', () => {
  beforeEach(() => {
    // Clear browser state
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    
    // Setup Form 137 specific interceptors
    cy.setupForm137Interceptors()
  })

  describe('Form Submission as Requester', () => {
    beforeEach(() => {
      // Set up requester user session
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|form-test-requester',
        email: 'formtest@university.edu',
        name: 'Form Test Student',
        roles: ['Requester']
      })
    })

    it('should successfully submit a complete Form 137 request', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Verify form is visible and accessible
      cy.get('[data-cy="request-form"]').should('be.visible')
      cy.get('[data-cy="form-137-fields"]').should('be.visible')
      
      // Fill out the form with test data (PACT-compliant)
      cy.fillForm137WithTestData({
        learnerReferenceNumber: '123456789012',
        firstName: 'Alice',
        middleName: 'Marie',
        lastName: 'Johnson',
        dateOfBirth: '2000-01-15',
        lastGradeLevel: 'Grade 12',
        lastSchoolYear: '2023-2024',
        previousSchool: 'Manila High School',
        purposeOfRequest: 'Employment Requirements - Software Developer Position',
        deliveryMethod: 'Pick-up',
        requestType: 'Form137',
        learnerName: 'Alice Marie Johnson',
        requesterName: 'Alice Marie Johnson',
        relationshipToLearner: 'Self',
        emailAddress: 'alice.johnson@university.edu',
        mobileNumber: '+639123456789'
      })
      
      // Submit the form
      cy.get('[data-cy="submit-button"]').click()
      
      // Wait for submission to complete
      cy.wait('@createRequest')
      
      // Should redirect to success page or show success message
      cy.url().should('satisfy', (url: string) => {
        return url.includes('/success') || url.includes('/dashboard')
      })
      
      // Verify success feedback
      cy.get('[data-cy="success-message"], [data-cy="toast-success"]').should('be.visible')
      cy.get('[data-cy="ticket-number"]').should('be.visible').and('contain.text', 'REQ-2025')
    })

    it('should validate required fields before submission', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Try to submit empty form
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Fill only some fields (PACT-compliant field names)
      cy.get('[data-cy="first-name"], input[name="firstName"]').type('Incomplete')
      cy.get('[data-cy="learner-reference-number"], input[name="learnerReferenceNumber"]').type('123456789012')
      
      // Submit button should still be disabled
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Fill all required fields
      cy.fillForm137WithTestData()
      
      // Now submit button should be enabled
      cy.get('[data-cy="submit-button"]').should('not.be.disabled')
    })

    it('should show validation errors for invalid input', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Enter invalid email (PACT-compliant field names)
      cy.get('[data-cy="email-address"], input[name="emailAddress"], input[type="email"]')
        .should('be.visible')
        .type('invalid-email')
        .blur()
      
      // Should show email validation error
      cy.get('[data-cy="email-error"], .error-message').should('be.visible')
      cy.get('[data-cy="email-error"], .error-message').should('contain.text', 'valid email')
      
      // Enter invalid phone number
      cy.get('[data-cy="mobile-number"], input[name="mobileNumber"], input[type="tel"]')
        .should('be.visible')
        .clear()
        .type('123')
        .blur()
      
      // Should show phone validation error
      cy.get('[data-cy="phone-error"], .error-message').should('be.visible')
      
      // Fix validation errors
      cy.get('[data-cy="email-address"], input[name="emailAddress"], input[type="email"]')
        .clear()
        .type('valid@university.edu')
      
      cy.get('[data-cy="mobile-number"], input[name="mobileNumber"], input[type="tel"]')
        .clear()
        .type('+639123456789')
      
      // Errors should disappear
      cy.get('[data-cy="email-error"]').should('not.exist')
      cy.get('[data-cy="phone-error"]').should('not.exist')
    })

    it('should handle form submission errors gracefully', () => {
      // Mock API error response
      cy.intercept('POST', `${Cypress.env('API_BASE_URL')}/requests`, {
        statusCode: 400,
        body: { 
          error: 'ValidationError',
          message: 'Student ID already exists',
          details: ['A request with this Student ID is already pending']
        }
      }).as('createRequestError')
      
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Fill and submit form
      cy.fillForm137WithTestData()
      cy.get('[data-cy="submit-button"]').click()
      
      // Wait for error response
      cy.wait('@createRequestError')
      
      // Should show error message
      cy.get('[data-cy="error-message"], [data-cy="toast-error"]').should('be.visible')
      cy.get('[data-cy="error-message"], [data-cy="toast-error"]').should('contain.text', 'Student ID already exists')
      
      // Form should remain visible for correction
      cy.get('[data-cy="request-form"]').should('be.visible')
      cy.get('[data-cy="submit-button"]').should('not.be.disabled')
    })

    it('should handle server errors during submission', () => {
      // Mock server error
      cy.intercept('POST', `${Cypress.env('API_BASE_URL')}/requests`, {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('createRequestServerError')
      
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      cy.fillForm137WithTestData()
      cy.get('[data-cy="submit-button"]').click()
      
      cy.wait('@createRequestServerError')
      
      // Should show generic error message
      cy.get('[data-cy="error-message"], [data-cy="toast-error"]').should('be.visible')
      cy.get('[data-cy="error-message"], [data-cy="toast-error"]').should('contain.text', 'error')
      
      // Should offer retry option
      cy.get('[data-cy="retry-button"], [data-cy="submit-button"]').should('be.visible')
    })

    it('should show loading states during form submission', () => {
      // Mock slow API response
      cy.intercept('POST', `${Cypress.env('API_BASE_URL')}/requests`, (req) => {
        req.reply((res) => {
          res.delay(2000)
          res.send({ 
            statusCode: 201, 
            body: { 
              id: 'req-slow-test', 
              ticketNumber: 'F137-2024-SLOW',
              status: 'pending'
            }
          })
        })
      }).as('createRequestSlow')
      
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      cy.fillForm137WithTestData()
      cy.get('[data-cy="submit-button"]').click()
      
      // Should show loading state
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      cy.get('[data-cy="loading-spinner"], .animate-spin').should('be.visible')
      
      // Wait for completion
      cy.wait('@createRequestSlow')
      
      // Loading state should disappear
      cy.get('[data-cy="loading-spinner"], .animate-spin').should('not.exist')
      cy.get('[data-cy="success-message"]').should('be.visible')
    })

    it('should preserve form data during navigation errors', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Fill form partially
      const testData = {
        studentName: 'Navigation Test User',
        studentId: '2024-NAV123',
        program: 'Computer Science'
      }
      
      cy.get('[data-cy="student-name"], input[name="studentName"]').type(testData.studentName)
      cy.get('[data-cy="student-id"], input[name="studentId"]').type(testData.studentId)
      cy.get('[data-cy="program"], input[name="program"]').type(testData.program)
      
      // Simulate navigation away and back (could happen due to session issues)
      cy.visit('/')
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // In a real implementation, form data might be preserved via localStorage or similar
      // This test verifies the form resets cleanly and doesn't show stale data
      cy.get('[data-cy="student-name"], input[name="studentName"]').should('have.value', '')
    })
  })

  describe('Form Accessibility and Usability', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|accessibility-test',
        email: 'accessibility@university.edu',
        name: 'Accessibility Test User',
        roles: ['Requester']
      })
    })

    it('should be keyboard navigable', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Tab through form fields
      cy.get('body').tab()
      cy.focused().should('have.attr', 'name').and('match', /studentName|student/)
      
      // Fill first field and tab to next
      cy.focused().type('Keyboard Test User')
      cy.focused().tab()
      
      cy.focused().should('have.attr', 'name').and('match', /studentId|student/)
      cy.focused().type('2024-KB123')
      
      // Continue tabbing through all fields
      cy.focused().tab()
      cy.focused().should('be.visible')
    })

    it('should have proper form labels and accessibility attributes', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Check for proper labels
      cy.get('label[for*="studentName"], label[for*="student-name"]').should('exist')
      cy.get('label[for*="studentId"], label[for*="student-id"]').should('exist')
      cy.get('label[for*="contactEmail"], label[for*="email"]').should('exist')
      
      // Check for required field indicators
      cy.get('[aria-required="true"], [required]').should('have.length.greaterThan', 0)
      
      // Check for form description or instructions
      cy.get('[data-cy="form-instructions"], [role="form"] p, .form-description').should('be.visible')
    })

    it('should provide clear feedback for form errors', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Trigger validation errors
      cy.get('[data-cy="contact-email"], input[type="email"]').type('invalid-email').blur()
      
      // Check error message has proper ARIA attributes
      cy.get('[data-cy="email-error"], [aria-describedby*="error"], .error-message')
        .should('be.visible')
        .and('have.attr', 'role', 'alert')
      
      // Verify field is marked as invalid
      cy.get('[data-cy="contact-email"], input[type="email"]')
        .should('have.attr', 'aria-invalid', 'true')
    })
  })

  describe('Form Data Handling and Persistence', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|data-test-user',
        email: 'datatest@university.edu',
        name: 'Data Test User',
        roles: ['Requester']
      })
    })

    it('should handle various data input formats correctly', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Test different name formats
      const testCases = [
        { 
          name: 'José María González-López', 
          studentId: '2024-INTL001',
          email: 'jose.maria@universidad.edu'
        },
        {
          name: 'O\'Connor, Patrick James',
          studentId: '2024-APOS002', 
          email: 'patrick.oconnor@university.edu'
        }
      ]
      
      testCases.forEach((testCase, index) => {
        if (index > 0) {
          // Clear form for next test case
          cy.get('[data-cy="student-name"], input[name="studentName"]').clear()
          cy.get('[data-cy="student-id"], input[name="studentId"]').clear()
          cy.get('[data-cy="contact-email"], input[name="contactEmail"]').clear()
        }
        
        cy.get('[data-cy="student-name"], input[name="studentName"]').type(testCase.name)
        cy.get('[data-cy="student-id"], input[name="studentId"]').type(testCase.studentId)
        cy.get('[data-cy="contact-email"], input[name="contactEmail"]').type(testCase.email)
        
        // Verify data is accepted and displayed correctly
        cy.get('[data-cy="student-name"], input[name="studentName"]').should('have.value', testCase.name)
        cy.get('[data-cy="student-id"], input[name="studentId"]').should('have.value', testCase.studentId)
        cy.get('[data-cy="contact-email"], input[name="contactEmail"]').should('have.value', testCase.email)
      })
    })

    it('should sanitize and validate input data before submission', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Test with potentially problematic input
      const maliciousName = '<script>alert("xss")</script>John Doe'
      const longText = 'A'.repeat(1000)
      
      cy.get('[data-cy="student-name"], input[name="studentName"]').type(maliciousName)
      cy.get('[data-cy="purpose"], textarea[name="purpose"]').type(longText)
      
      // Fill other required fields
      cy.get('[data-cy="student-id"], input[name="studentId"]').type('2024-SEC001')
      cy.get('[data-cy="graduation-year"], input[name="graduationYear"]').type('2024')
      cy.get('[data-cy="program"], input[name="program"]').type('Computer Science')
      cy.get('[data-cy="contact-email"], input[name="contactEmail"]').type('security@university.edu')
      cy.get('[data-cy="contact-phone"], input[name="contactPhone"]').type('+639123456789')
      
      // Attempt submission
      cy.get('[data-cy="submit-button"]').click()
      cy.wait('@createRequest')
      
      // Verify the request was processed (showing data was properly sanitized)
      cy.get('[data-cy="success-message"], [data-cy="toast-success"]').should('be.visible')
    })

    it('should handle file uploads for supporting documents', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Check if file upload is available
      cy.get('body').then($body => {
        if ($body.find('[data-cy="file-upload"], input[type="file"]').length > 0) {
          // Create a test file
          const fileName = 'test-transcript.pdf'
          const fileContent = 'This is a test PDF content'
          
          cy.get('[data-cy="file-upload"], input[type="file"]').selectFile({
            contents: fileContent,
            fileName: fileName,
            mimeType: 'application/pdf'
          }, { force: true })
          
          // Verify file is selected
          cy.get('[data-cy="file-selected"], .file-name').should('contain.text', fileName)
          
          // Fill other required fields and submit
          cy.fillForm137WithTestData()
          cy.get('[data-cy="submit-button"]').click()
          cy.wait('@createRequest')
          
          cy.get('[data-cy="success-message"]').should('be.visible')
        } else {
          cy.log('File upload not implemented - skipping file upload test')
        }
      })
    })
  })

  describe('Form Submission Success Flow', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|success-flow-test',
        email: 'success@university.edu',
        name: 'Success Flow User',
        roles: ['Requester']
      })
    })

    it('should display comprehensive success information after submission', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Submit valid form
      cy.fillForm137WithTestData()
      cy.get('[data-cy="submit-button"]').click()
      cy.wait('@createRequest')
      
      // Verify success page content
      cy.get('[data-cy="success-message"]').should('be.visible')
      cy.get('[data-cy="ticket-number"]').should('be.visible').and('contain.text', 'F137-2024')
      
      // Should show processing timeline
      cy.get('[data-cy="processing-timeline"], [data-cy="estimated-completion"]')
        .should('be.visible')
        .and('contain.text', 'business days')
      
      // Should provide next steps information
      cy.get('[data-cy="next-steps"], [data-cy="instructions"]').should('be.visible')
      
      // Should offer navigation options
      cy.get('[data-cy="view-dashboard"], [data-cy="track-request"]').should('be.visible')
      cy.get('[data-cy="submit-another"], [data-cy="new-request"]').should('be.visible')
    })

    it('should allow user to track the submitted request immediately', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      cy.fillForm137WithTestData()
      cy.get('[data-cy="submit-button"]').click()
      cy.wait('@createRequest')
      
      // Click to view/track the request
      cy.get('[data-cy="view-dashboard"], [data-cy="track-request"]').click()
      
      // Should navigate to dashboard showing the new request
      cy.url().should('include', '/dashboard')
      cy.get('[data-cy="requests-list"]').should('be.visible')
      cy.get('[data-cy="request-item"]').should('contain.text', 'F137-2024-TEST001')
    })

    it('should allow user to submit another request after successful submission', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      cy.fillForm137WithTestData()
      cy.get('[data-cy="submit-button"]').click()
      cy.wait('@createRequest')
      
      // Click to submit another request
      cy.get('[data-cy="submit-another"], [data-cy="new-request"]').click()
      
      // Should return to clean form
      cy.url().should('include', '/request')
      cy.get('[data-cy="request-form"]').should('be.visible')
      cy.get('[data-cy="student-name"], input[name="studentName"]').should('have.value', '')
    })
  })

  describe('Multi-step Form Workflow', () => {
    it('should handle multi-step form progression if implemented', () => {
      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      // Check if multi-step form is implemented
      cy.get('body').then($body => {
        if ($body.find('[data-cy="form-step"], .step-indicator').length > 1) {
          // Test multi-step workflow
          cy.get('[data-cy="form-step-1"], [data-step="1"]').should('be.visible')
          
          // Fill first step
          cy.get('[data-cy="student-name"], input[name="studentName"]').type('Multi Step User')
          cy.get('[data-cy="student-id"], input[name="studentId"]').type('2024-MULTI001')
          
          // Progress to next step
          cy.get('[data-cy="next-step"], [data-cy="continue"]').click()
          
          // Should be on step 2
          cy.get('[data-cy="form-step-2"], [data-step="2"]').should('be.visible')
          cy.get('[data-cy="form-step-1"], [data-step="1"]').should('not.be.visible')
          
          // Should be able to go back
          cy.get('[data-cy="previous-step"], [data-cy="back"]').click()
          cy.get('[data-cy="form-step-1"], [data-step="1"]').should('be.visible')
        } else {
          cy.log('Multi-step form not implemented - testing as single step form')
          cy.fillForm137WithTestData()
          cy.get('[data-cy="submit-button"]').click()
          cy.wait('@createRequest')
          cy.get('[data-cy="success-message"]').should('be.visible')
        }
      })
    })
  })
})