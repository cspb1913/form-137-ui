describe('Dashboard View Details Modal', () => {
  it('should open modal with request details when View Details is clicked', () => {
    // Mock authenticated user to access dashboard
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

    // Mock dashboard data with a real request ID from backend logs
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

    // Mock the comment submission API call
    cy.intercept('POST', '/api/dashboard/request/68847b3424808fd99e58301f/comments', {
      statusCode: 200,
      body: {
        id: 'comment-123',
        message: 'Test comment',
        author: 'Test User',
        createdAt: new Date().toISOString()
      }
    }).as('addComment')

    // Visit dashboard
    cy.visit('/dashboard', { failOnStatusCode: false });
    
    // Wait for API calls
    cy.wait('@authMe')
    cy.wait('@dashboardData', { timeout: 10000 })
    
    // Wait for dashboard to load
    cy.contains('Form 137 Dashboard', { timeout: 10000 }).should('be.visible');
    
    // Wait for table to load with data
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 1);
    
    // Take screenshot before clicking
    cy.screenshot('dashboard-before-click', { 
      capture: 'viewport',
      overwrite: true
    });
    
    // Find and click the first "View Details" button
    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('View Details').should('be.visible').click();
    });
    
    // Wait for modal to open
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
    
    // Take screenshot after modal opens
    cy.screenshot('modal-opened', {
      capture: 'fullPage', 
      overwrite: true
    });
    
    // Verify modal content is visible
    cy.contains('Form 137 Request Details', { timeout: 5000 }).should('be.visible');
    cy.contains('Ticket #REQ-0726202556145').should('be.visible');
    cy.contains('Student Information').should('be.visible');
    cy.contains('Test A User').should('be.visible');
    cy.contains('123456789012').should('be.visible');
    
    // Test adding a comment (scroll and interact within modal)
    cy.get('textarea[placeholder*="Enter your comment"]').scrollIntoView();
    cy.get('textarea[placeholder*="Enter your comment"]').type('This is a test comment from Cypress', { force: true });
    cy.get('button').contains('Add Comment').click();
    
    // Verify comment was added (should appear in the UI)
    cy.contains('This is a test comment from Cypress', { timeout: 5000 }).should('be.visible');
    
    // Take screenshot with comment added
    cy.screenshot('comment-added', {
      capture: 'fullPage', 
      overwrite: true
    });
  });

  it('should handle comment submission errors gracefully', () => {
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
        stats: { totalRequests: 5, pendingRequests: 2, completedRequests: 2, rejectedRequests: 1 }
      }
    }).as('dashboardData')
    
    // Intercept the comment submission API call to simulate an error
    cy.intercept('POST', '/api/dashboard/request/68847b3424808fd99e58301f/comments', {
      statusCode: 500,
      body: { error: 'Failed to add comment' }
    }).as('addCommentError');
    
    // Visit dashboard
    cy.visit('/dashboard', { failOnStatusCode: false });
    
    // Wait for API calls
    cy.wait('@authMe')
    cy.wait('@dashboardData')
    
    // Wait for dashboard to load
    cy.contains('Form 137 Dashboard', { timeout: 10000 }).should('be.visible');
    
    // Click View Details button to open modal
    cy.get('tbody tr').first().within(() => {
      cy.get('button').contains('View Details').click();
    });
    
    // Wait for modal to open
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
    
    // Try to add a comment that will fail
    cy.get('textarea[placeholder*="Enter your comment"]').scrollIntoView();
    cy.get('textarea[placeholder*="Enter your comment"]').type('This comment will fail', { force: true });
    cy.get('button').contains('Add Comment').click();
    
    // Wait for the failed API call
    cy.wait('@addCommentError');
    
    // Take screenshot of error state
    cy.screenshot('comment-error-state', {
      capture: 'fullPage',
      overwrite: true
    });
  });
});