/// <reference types="cypress" />

describe('Dashboard Layout Screenshot', () => {
  it('should take screenshot of dashboard layout for alignment review', () => {
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

    // Mock dashboard data to show content
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
    
    // Wait for API calls
    cy.wait('@authMe')
    cy.wait('@dashboardData', { timeout: 10000 })
    
    // Wait for page to fully load
    cy.get('main', { timeout: 10000 }).should('be.visible')
    
    // Take screenshot of full page
    cy.screenshot('dashboard-layout-full-page', {
      capture: 'fullPage'
    })
    
    // Take screenshot of viewport
    cy.screenshot('dashboard-layout-viewport', {
      capture: 'viewport'
    })
    
    // Log success
    cy.log('✅ Dashboard layout screenshots captured')
  })

  it('should capture header and navigation alignment', () => {
    // Mock authenticated user
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          sub: 'auth0|test123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['Requester']
        }
      }
    }).as('authMe')

    // Visit homepage/dashboard
    cy.visit('/')
    cy.wait('@authMe')
    
    // Wait for navigation to load
    cy.get('nav', { timeout: 5000 }).should('be.visible')
    
    // Take screenshot focused on header/nav area
    cy.get('nav').screenshot('header-navigation-alignment')
    
    cy.log('✅ Header navigation alignment screenshot captured')
  })
})