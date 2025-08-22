describe('Dashboard Modal Functionality', () => {
  it('should open and interact with request details modal', () => {
    // Mock authenticated user
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          sub: 'auth0|test123',
          name: 'Test User',
          email: 'testuser@cspb.edu.ph',
          roles: ['Requester']
        }
      }
    }).as('authMe')

    // Mock dashboard data
    cy.intercept('GET', '/api/dashboard/requests', {
      statusCode: 200,
      body: {
        requests: [
          {
            id: '68847b3424808fd99e58301f',
            ticketNumber: 'REQ-0726202556145',
            learnerName: 'Test A User',
            learnerReferenceNumber: '123456789012',
            previousSchool: 'CSPB Main',
            status: 'processing',
            submittedAt: '2025-07-26T06:52:36.145886737Z',
            requesterEmail: 'testuser@cspb.edu.ph',
            mobileNumber: '09123456789',
            lastSchoolYear: '2024',
            purposeOfRequest: 'Testing purposes',
            deliveryMethod: 'pickup',
            comments: [],
            documents: []
          }
        ],
        stats: {
          totalRequests: 5,
          pendingRequests: 2,
          completedRequests: 2,
          rejectedRequests: 1
        }
      }
    }).as('dashboardData')

    // Visit dashboard
    cy.visit('/dashboard')
    
    // Wait for API calls
    cy.wait('@authMe')
    cy.wait('@dashboardData')
    
    // Wait for dashboard to load
    cy.contains('Form 137 Dashboard', { timeout: 10000 }).should('be.visible')
    
    // Click View Details button
    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('View Details').click()
    })
    
    // Verify modal opened
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible')
    cy.contains('Form 137 Request Details').should('be.visible')
    cy.contains('REQ-0726202556145').should('be.visible')
    cy.contains('Test A User').should('be.visible')
    
    // Take screenshot
    cy.screenshot('modal-success', { capture: 'viewport' })
    
    // Verify sections are present and test scrolling
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Student Information').should('exist')
      cy.contains('Request Details').should('exist')
      
      // Scroll down to see Comments section
      cy.get('[data-radix-scroll-area-viewport]').scrollTo('bottom')
      cy.contains('Comments & Updates').should('exist')
      cy.contains('Add a comment').should('exist')
      
      // Take screenshot after scrolling
      cy.screenshot('modal-scrolled-to-bottom', { capture: 'fullPage' })
      
      // Scroll back to top
      cy.get('[data-radix-scroll-area-viewport]').scrollTo('top')
    })
    
    // Test that modal closes (press Escape key)
    cy.get('body').type('{esc}')
    cy.get('[role="dialog"]').should('not.exist')
  })
})