/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Ensure we start with a clean slate
    cy.clearLocalStorage()
    cy.clearCookies()
    
    // Set up common API interceptors
    cy.intercept('GET', '/api/auth/me', { 
      statusCode: 401, 
      body: { error: 'Unauthorized' }
    }).as('getUserUnauthenticated')
  })

  describe('Unauthenticated User Experience', () => {
    it('should redirect to login prompt when accessing the home page', () => {
      cy.visit('/')
      
      // Should see login prompt for unauthenticated users
      cy.contains('Welcome Back').should('be.visible')
      cy.contains('Sign In to Continue').should('be.visible')
      
      // Should not see authenticated content like dashboard
      cy.get('nav').should('be.visible') // TopNavigation should be visible
      cy.contains('Form 137 Portal').should('be.visible')
    })

    it('should show login prompt on protected routes', () => {
      cy.visit('/dashboard')
      
      // Should redirect or show login prompt
      cy.contains('Welcome Back').should('be.visible')
      cy.contains('Sign In to Continue').should('be.visible')
    })

    it('should block access to admin routes', () => {
      cy.visit('/admin')
      
      // Should not be able to access admin content
      cy.contains('Welcome Back').should('be.visible')
      cy.contains('Sign In to Continue').should('be.visible')
    })

    it('should handle authentication errors gracefully', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getUserError')
      
      cy.visit('/')
      cy.wait('@getUserError')
      
      // Should still show login prompt even with API errors
      cy.contains('Welcome Back').should('be.visible')
      cy.contains('Sign In to Continue').should('be.visible')
    })
  })

  describe('User Authentication Process', () => {
    it('should successfully authenticate a requester user', () => {
      // Mock successful authentication
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      
      cy.visit('/')
      
      // Simulate successful login by directly setting up the mock
      cy.mockUserSession({
        sub: 'auth0|requester-test',
        email: 'requester@test.com',
        name: 'Test Requester',
        roles: ['Requester']
      })
      
      cy.reload()
      cy.wait('@getRequesterUser')
      
      // Should see dashboard for requester
      cy.get('[data-cy="dashboard"]').should('be.visible')
      cy.get('[data-cy="user-profile"]').should('contain.text', 'Test Requester')
      
      // Should not redirect to admin (stays on home page with dashboard)
      cy.url().should('not.include', '/admin')
    })

    it('should successfully authenticate an admin user and redirect', () => {
      // Mock successful admin authentication
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
      
      cy.visit('/')
      
      // Simulate admin login
      cy.mockUserSession({
        sub: 'auth0|admin-test',
        email: 'admin@test.com',
        name: 'Test Admin',
        roles: ['Admin']
      })
      
      cy.reload()
      cy.wait('@getAdminUser')
      
      // Admin should be redirected to admin dashboard
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.get('[data-cy="user-profile"]').should('contain.text', 'Test Admin')
    })

    it('should handle users with no roles appropriately', () => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-no-roles.json' }).as('getUserNoRoles')
      
      cy.visit('/')
      
      cy.mockUserSession({
        sub: 'auth0|no-roles-test',
        email: 'noroles@test.com',
        name: 'No Roles User',
        roles: []
      })
      
      cy.reload()
      cy.wait('@getUserNoRoles')
      
      // Should redirect to unauthorized page
      cy.url().should('include', '/unauthorized')
      cy.get('[data-cy="unauthorized-message"]').should('be.visible')
    })
  })

  describe('Session Management', () => {
    it('should maintain session across page reloads', () => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getUser')
      
      cy.mockUserSession({
        sub: 'auth0|session-test',
        email: 'session@test.com',
        name: 'Session Test User',
        roles: ['Requester']
      })
      
      cy.visit('/')
      cy.wait('@getUser')
      
      // Verify initial authentication
      cy.get('[data-cy="dashboard"]').should('be.visible')
      
      // Reload page
      cy.reload()
      cy.wait('@getUser')
      
      // Should still be authenticated
      cy.get('[data-cy="dashboard"]').should('be.visible')
      cy.get('[data-cy="user-profile"]').should('contain.text', 'Session Test User')
    })

    it('should handle session expiry gracefully', () => {
      // Start with valid session
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getValidUser')
      
      cy.mockUserSession({
        sub: 'auth0|expiry-test',
        email: 'expiry@test.com',
        name: 'Expiry Test User',
        roles: ['Requester']
      })
      
      cy.visit('/')
      cy.wait('@getValidUser')
      cy.get('[data-cy="dashboard"]').should('be.visible')
      
      // Simulate session expiry
      cy.intercept('GET', '/api/auth/me', { 
        statusCode: 401, 
        body: { error: 'Token expired' }
      }).as('getExpiredUser')
      
      // Trigger a request that would check authentication
      cy.reload()
      cy.wait('@getExpiredUser')
      
      // Should show login prompt
      cy.get('[data-cy="login-prompt"]').should('be.visible')
      cy.get('[data-cy="dashboard"]').should('not.exist')
    })

    it('should clear session on logout', () => {
      // Set up authenticated session
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getUser')
      
      cy.mockUserSession({
        sub: 'auth0|logout-test',
        email: 'logout@test.com',
        name: 'Logout Test User',
        roles: ['Requester']
      })
      
      cy.visit('/')
      cy.wait('@getUser')
      cy.get('[data-cy="dashboard"]').should('be.visible')
      
      // Mock logout response
      cy.intercept('GET', '/api/auth/logout', { 
        statusCode: 302, 
        headers: { location: '/' }
      }).as('logout')
      
      // Mock post-logout user state
      cy.intercept('GET', '/api/auth/me', { 
        statusCode: 401, 
        body: { error: 'Unauthorized' }
      }).as('getLoggedOutUser')
      
      // Click logout
      cy.get('[data-cy="logout-button"]').click()
      
      // Should be redirected and unauthenticated
      cy.get('[data-cy="login-prompt"]').should('be.visible')
      cy.get('[data-cy="dashboard"]').should('not.exist')
    })
  })

  describe('Authentication Edge Cases', () => {
    it('should handle malformed user data', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: {
          sub: null,
          email: '',
          name: undefined,
          roles: null
        }
      }).as('getMalformedUser')
      
      cy.visit('/')
      cy.wait('@getMalformedUser')
      
      // Should handle gracefully - either show error or redirect to unauthorized
      cy.url().should('satisfy', (url: string) => {
        return url.includes('/unauthorized') || url === Cypress.config().baseUrl + '/'
      })
    })

    it('should handle network errors during authentication', () => {
      cy.intercept('GET', '/api/auth/me', { forceNetworkError: true }).as('getNetworkError')
      
      cy.visit('/')
      cy.wait('@getNetworkError')
      
      // Should show some form of error handling or fallback
      // This could be a retry mechanism, error message, or login prompt
      cy.get('[data-cy="login-prompt"], [data-cy="error-message"], [data-cy="retry-button"]')
        .should('exist')
    })

    it('should handle slow authentication responses', () => {
      cy.intercept('GET', '/api/auth/me', (req) => {
        req.reply((res) => {
          // Delay response by 3 seconds
          res.delay(3000)
          res.send({ fixture: 'user-requester.json' })
        })
      }).as('getSlowUser')
      
      cy.visit('/')
      
      // Should show loading state
      cy.get('[data-cy="loading"], .animate-spin').should('be.visible')
      
      // Wait for slow response
      cy.wait('@getSlowUser')
      
      // Should eventually show content
      cy.get('[data-cy="dashboard"]').should('be.visible')
      cy.get('[data-cy="loading"], .animate-spin').should('not.exist')
    })
  })

  describe('Real Auth0 Integration Tests', () => {
    // These tests should only run when Auth0 credentials are available
    beforeEach(() => {
      // Skip if no Auth0 credentials are configured
      if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_ADMIN_USERNAME')) {
        cy.log('Skipping Auth0 integration tests - credentials not configured')
        return
      }
    })

    it('should complete full Auth0 login flow for requester', () => {
      // Only run if Auth0 credentials are available
      cy.skipOn(!Cypress.env('AUTH0_REQUESTER_USERNAME'))
      
      cy.loginAsRequester()
      
      // Should be on dashboard after login
      cy.get('[data-cy="dashboard"]').should('be.visible')
      cy.checkUserRole('requester')
    })

    it('should complete full Auth0 login flow for admin', () => {
      // Only run if Auth0 credentials are available  
      cy.skipOn(!Cypress.env('AUTH0_ADMIN_USERNAME'))
      
      cy.loginAsAdmin()
      
      // Should be redirected to admin page
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      cy.checkUserRole('admin')
    })

    it('should handle logout correctly with Auth0', () => {
      cy.skipOn(!Cypress.env('AUTH0_REQUESTER_USERNAME'))
      
      cy.loginAsRequester()
      cy.get('[data-cy="dashboard"]').should('be.visible')
      
      cy.logoutUser()
      
      // Should be back to login state
      cy.get('[data-cy="login-prompt"]').should('be.visible')
      cy.get('[data-cy="dashboard"]').should('not.exist')
    })
  })
})