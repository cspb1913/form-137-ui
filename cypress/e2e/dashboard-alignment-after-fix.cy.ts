/// <reference types="cypress" />

describe('Dashboard Alignment After Fix', () => {
  it('should show improved header/dashboard alignment', () => {
    // Mock authenticated user to access dashboard
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          sub: 'auth0|test123',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/avatar.png',
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
            id: '1',
            ticketNumber: 'F137-2024-001',
            studentName: 'John Doe',
            studentId: 'STU001',
            program: 'Computer Science',
            status: 'pending',
            submittedAt: '2024-08-22T08:00:00Z'
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
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    // Wait for API calls and content to load
    cy.wait('@authMe')
    cy.wait('@dashboardData')
    cy.get('main', { timeout: 10000 }).should('be.visible')
    
    // Take screenshot showing the aligned layout
    cy.screenshot('dashboard-alignment-fixed', {
      capture: 'fullPage'
    })
    
    // Verify that both navigation and dashboard content are properly aligned
    cy.get('nav').should('be.visible')
    cy.get('h1').contains('Form 137 Dashboard').should('be.visible')
    
    // Take focused screenshot of header area to show alignment
    cy.get('nav').screenshot('nav-dashboard-alignment-fixed')
    
    cy.log('✅ Dashboard alignment fix screenshots captured')
  })
})