describe('Modal Comment Functionality', () => {
  it('should add comment successfully', () => {
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

    // Mock the CORRECTED comment API endpoint
    cy.intercept('POST', '/api/dashboard/request/68847b3424808fd99e58301f/comment', {
      statusCode: 201,
      body: {
        id: 'comment-123',
        message: 'Test comment from Cypress',
        author: 'Test User',
        createdAt: new Date().toISOString()
      }
    }).as('addComment')

    // Visit dashboard
    cy.visit('/dashboard')
    cy.wait('@authMe')
    cy.wait('@dashboardData')
    cy.contains('Form 137 Dashboard', { timeout: 10000 }).should('be.visible')
    
    // Click View Details button
    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('View Details').click()
    })
    
    // Verify modal opened
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible')
    
    // Scroll to comments section and add comment
    cy.get('[role="dialog"]').within(() => {
      cy.get('[data-radix-scroll-area-viewport]').scrollTo('bottom')
      cy.get('textarea[placeholder*="Enter your comment"]').type('Test comment from Cypress', { force: true })
      cy.get('button').contains('Add Comment').click()
    })
    
    // Wait for API call
    cy.wait('@addComment')
    
    // Verify comment appears in UI
    cy.contains('Test comment from Cypress', { timeout: 5000 }).should('be.visible')
    
    // Take screenshot
    cy.screenshot('comment-added-successfully')
  })
})