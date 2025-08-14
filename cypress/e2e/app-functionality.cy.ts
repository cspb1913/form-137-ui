/// <reference types="cypress" />

describe('Form 137 Portal - Core Functionality', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('Application Loading and Navigation', () => {
    it('should load the homepage successfully', () => {
      cy.visit('/')
      
      // Basic application structure should be present
      cy.contains('Form 137 Portal').should('be.visible')
      cy.get('nav').should('be.visible')
      cy.get('main').should('be.visible')
    })

    it('should show login prompt for unauthenticated users', () => {
      // Mock unauthenticated state
      cy.intercept('GET', '/api/auth/me', { 
        statusCode: 401, 
        body: { error: 'Unauthorized' } 
      }).as('getUnauthenticatedUser')
      
      cy.visit('/')
      cy.wait('@getUnauthenticatedUser')
      
      // Should show login page elements
      cy.contains('Form 137 Request Portal').should('be.visible')
      cy.contains('Welcome Back').should('be.visible')
      cy.contains('Sign In to Continue').should('be.visible')
      cy.contains('Secure authentication powered by Auth0').should('be.visible')
      
      // Should have proper login link
      cy.get('a[href="/api/auth/login"]').should('be.visible')
    })

    it('should handle loading states properly', () => {
      // Mock slow authentication response
      cy.intercept('GET', '/api/auth/me', (req) => {
        req.reply((res) => {
          res.delay(2000)
          res.send({ 
            statusCode: 401, 
            body: { error: 'Unauthorized' } 
          })
        })
      }).as('getSlowAuth')
      
      cy.visit('/')
      
      // Should show loading spinner
      cy.get('.animate-spin').should('be.visible')
      
      // Wait for response
      cy.wait('@getSlowAuth')
      
      // Should eventually show login prompt
      cy.contains('Welcome Back').should('be.visible')
    })
  })

  describe('Authentication Flow Simulation', () => {
    it('should handle successful requester authentication', () => {
      // Mock successful requester authentication
      cy.intercept('GET', '/api/auth/me', { 
        statusCode: 200,
        body: {
          sub: 'auth0|requester-test',
          email: 'requester@test.com',
          name: 'Test Requester',
          roles: ['Requester']
        }
      }).as('getRequesterUser')
      
      cy.visit('/')
      cy.wait('@getRequesterUser')
      
      // Should show dashboard content instead of login prompt
      cy.get('.animate-spin').should('not.exist')
      cy.contains('Welcome Back').should('not.exist')
      
      // Should display user content (Dashboard component should load)
      cy.get('main').should('be.visible')
      cy.get('nav').should('be.visible')
    })

    it('should redirect admin users to admin page', () => {
      // Mock successful admin authentication
      cy.intercept('GET', '/api/auth/me', { 
        statusCode: 200,
        body: {
          sub: 'auth0|admin-test',
          email: 'admin@test.com',
          name: 'Test Admin',
          roles: ['Admin']
        }
      }).as('getAdminUser')
      
      cy.visit('/')
      cy.wait('@getAdminUser')
      
      // Admin should be redirected to /admin
      cy.url().should('include', '/admin')
    })

    it('should handle users without roles', () => {
      // Mock user with no roles
      cy.intercept('GET', '/api/auth/me', { 
        statusCode: 200,
        body: {
          sub: 'auth0|no-roles-test',
          email: 'noroles@test.com',
          name: 'No Roles User',
          roles: []
        }
      }).as('getUserNoRoles')
      
      cy.visit('/')
      cy.wait('@getUserNoRoles')
      
      // Should redirect to unauthorized page
      cy.url().should('include', '/unauthorized')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Mock server error
      cy.intercept('GET', '/api/auth/me', { 
        statusCode: 500, 
        body: { error: 'Internal Server Error' } 
      }).as('getServerError')
      
      cy.visit('/')
      cy.wait('@getServerError')
      
      // Should still show a usable interface (login prompt)
      cy.contains('Welcome Back').should('be.visible')
    })

    it('should handle network errors', () => {
      // Mock network failure
      cy.intercept('GET', '/api/auth/me', { forceNetworkError: true }).as('getNetworkError')
      
      cy.visit('/')
      cy.wait('@getNetworkError')
      
      // Should show login prompt as fallback
      cy.contains('Welcome Back').should('be.visible')
    })
  })

  describe('API Health Check', () => {
    it('should verify API connectivity', () => {
      // Use the task from cypress config to check API health
      cy.task('checkApiHealth').then((result: any) => {
        expect(result).to.have.property('status')
        // Log the result for debugging
        cy.log('API Health Check:', JSON.stringify(result))
      })
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on tablet viewport', () => {
      cy.viewport(768, 1024)
      cy.intercept('GET', '/api/auth/me', { statusCode: 401, body: { error: 'Unauthorized' } })
      
      cy.visit('/')
      
      // Should still display properly on tablet
      cy.contains('Form 137 Portal').should('be.visible')
      cy.contains('Welcome Back').should('be.visible')
    })

    it('should be responsive on mobile viewport', () => {
      cy.viewport(375, 667)
      cy.intercept('GET', '/api/auth/me', { statusCode: 401, body: { error: 'Unauthorized' } })
      
      cy.visit('/')
      
      // Should still display properly on mobile
      cy.contains('Form 137 Portal').should('be.visible')
      cy.contains('Welcome Back').should('be.visible')
      cy.get('a[href="/api/auth/login"]').should('be.visible')
    })
  })
})