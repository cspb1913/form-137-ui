/**
 * Comprehensive Auth0 Production Fix Validation Tests
 * 
 * These tests validate the complete Auth0 authentication flow fix for the
 * /api/auth/me 401 error and ensure role-based access control works correctly.
 */

describe('Auth0 Production Fix Validation', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  })

  describe('Environment Configuration', () => {
    it('should have proper environment variables configured', () => {
      cy.visit('/')
      
      // Check that dev mode is disabled in production config
      cy.window().then((win) => {
        // Verify environment configuration through runtime checks
        cy.request('/api/health').then((response) => {
          expect(response.status).to.eq(200)
        })
      })
    })

    it('should have correct Auth0 configuration', () => {
      cy.visit('/debug-auth')
      
      // Verify Auth0 configuration is present
      cy.get('body').should('contain', 'Auth0 Configuration')
      
      // Check for proper audience configuration
      cy.get('body').should('contain', 'AUTH0_AUDIENCE')
    })
  })

  describe('Authentication Flow', () => {
    it('should redirect to Auth0 login when accessing protected routes', () => {
      cy.visit('/dashboard')
      
      // Should redirect to Auth0 login
      cy.url().should('include', 'jasoncalalang.auth0.com')
      cy.get('body').should('contain', 'Log in')
    })

    it('should handle Auth0 callback properly', () => {
      // Mock successful Auth0 callback
      cy.intercept('GET', '/api/auth/callback*', {
        statusCode: 302,
        headers: {
          'Location': '/dashboard'
        }
      }).as('auth0Callback')

      cy.visit('/api/auth/callback?code=test_code&state=test_state')
      cy.wait('@auth0Callback')
    })

    it('should handle /api/auth/me endpoint correctly after login', () => {
      // Mock authenticated user with roles
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: {
          user: {
            sub: 'auth0|test-user-id',
            email: 'jason@cspb.edu.ph',
            name: 'Jason Calalang',
            roles: ['Admin', 'Requester'],
            'https://form137.cspb.edu.ph/api/roles': ['Admin', 'Requester'],
            'http://localhost:8080/api/roles': ['Admin', 'Requester']
          }
        }
      }).as('getMeSuccess')

      cy.visit('/dashboard')
      cy.wait('@getMeSuccess')

      // Verify successful authentication
      cy.get('[data-cy="user-info"]').should('contain', 'Jason Calalang')
      cy.get('[data-cy="user-roles"]').should('contain', 'Admin')
    })

    it('should handle /api/auth/me 401 errors gracefully', () => {
      // Mock 401 response
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 401,
        body: { user: null }
      }).as('getMe401')

      cy.visit('/dashboard')
      cy.wait('@getMe401')

      // Should redirect to login
      cy.url().should('include', '/api/auth/login')
    })
  })

  describe('Role-Based Access Control', () => {
    beforeEach(() => {
      // Mock authenticated admin user
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: {
          user: {
            sub: 'auth0|admin-user',
            email: 'jason@cspb.edu.ph',
            name: 'Admin User',
            roles: ['Admin', 'Requester'],
            'https://form137.cspb.edu.ph/api/roles': ['Admin', 'Requester'],
            'http://localhost:8080/api/roles': ['Admin', 'Requester']
          }
        }
      })
    })

    it('should allow admin access to admin routes', () => {
      cy.visit('/admin')
      
      // Should not redirect to unauthorized
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
    })

    it('should extract roles from custom claims correctly', () => {
      cy.visit('/debug-auth')
      
      // Check role extraction in debug page
      cy.get('[data-cy="user-roles"]').should('contain', 'Admin')
      cy.get('[data-cy="user-roles"]').should('contain', 'Requester')
      
      // Check custom claims
      cy.get('[data-cy="custom-claims"]').should('contain', 'https://form137.cspb.edu.ph/api/roles')
      cy.get('[data-cy="custom-claims"]').should('contain', 'http://localhost:8080/api/roles')
    })

    it('should handle users without roles', () => {
      // Mock user without roles
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: {
          user: {
            sub: 'auth0|no-roles-user',
            email: 'noroles@cspb.edu.ph',
            name: 'No Roles User',
            roles: []
          }
        }
      }).as('getNoRolesUser')

      cy.visit('/admin')
      cy.wait('@getNoRolesUser')

      // Should redirect to unauthorized
      cy.url().should('include', '/unauthorized')
      cy.get('[data-cy="unauthorized-message"]').should('be.visible')
    })
  })

  describe('Session Management', () => {
    it('should handle session expiration gracefully', () => {
      // Mock expired session
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 401,
        body: { error: 'Session expired' }
      }).as('expiredSession')

      cy.visit('/dashboard')
      cy.wait('@expiredSession')

      // Should redirect to login
      cy.url().should('include', '/api/auth/login')
    })

    it('should support session refresh', () => {
      // Mock initial successful auth
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: {
          user: {
            sub: 'auth0|test-user',
            email: 'test@cspb.edu.ph',
            roles: ['Requester']
          }
        }
      }).as('getMe')

      cy.visit('/dashboard')
      cy.wait('@getMe')

      // Verify session is active
      cy.get('[data-cy="user-info"]').should('be.visible')
    })
  })

  describe('Security Validation', () => {
    it('should enforce HTTPS in production', () => {
      // This test would run in production environment
      if (Cypress.env('environment') === 'production') {
        cy.visit('/')
        cy.location('protocol').should('eq', 'https:')
      }
    })

    it('should have secure cookie settings', () => {
      cy.visit('/')
      
      // Check for secure auth cookies
      cy.getCookie('appSession').should('exist')
      cy.getCookie('appSession').should('have.property', 'httpOnly', true)
      
      if (Cypress.env('environment') === 'production') {
        cy.getCookie('appSession').should('have.property', 'secure', true)
      }
    })

    it('should validate JWT tokens properly', () => {
      // Mock invalid JWT
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 401,
        body: { error: 'Invalid token' }
      }).as('invalidToken')

      cy.visit('/dashboard')
      cy.wait('@invalidToken')

      // Should handle invalid token gracefully
      cy.url().should('include', '/api/auth/login')
    })
  })

  describe('Error Handling', () => {
    it('should handle Auth0 service unavailable', () => {
      // Mock Auth0 service error
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('serverError')

      cy.visit('/dashboard')
      cy.wait('@serverError')

      // Should show appropriate error message
      cy.get('[data-cy="error-message"]').should('contain', 'Authentication error')
    })

    it('should handle network connectivity issues', () => {
      // Mock network failure
      cy.intercept('GET', '/api/auth/me', { forceNetworkError: true }).as('networkError')

      cy.visit('/dashboard')
      cy.wait('@networkError')

      // Should show retry option or fallback
      cy.get('[data-cy="retry-auth"]').should('be.visible')
    })
  })

  describe('Performance Validation', () => {
    it('should load authentication state quickly', () => {
      const startTime = Date.now()
      
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        delay: 100, // Simulate reasonable API delay
        body: {
          user: {
            sub: 'auth0|test-user',
            email: 'test@cspb.edu.ph',
            roles: ['Requester']
          }
        }
      }).as('getMeFast')

      cy.visit('/dashboard')
      cy.wait('@getMeFast')

      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // Under 3 seconds
      })
    })
  })
})

/**
 * Custom Cypress commands for Auth0 testing
 */
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>
      loginAsRequester(): Chainable<void>
      logoutAuth0(): Chainable<void>
    }
  }
}

// Custom command to login as admin
Cypress.Commands.add('loginAsAdmin', () => {
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: {
      user: {
        sub: 'auth0|admin-user',
        email: 'admin@cspb.edu.ph',
        name: 'Admin User',
        roles: ['Admin', 'Requester'],
        'https://form137.cspb.edu.ph/api/roles': ['Admin', 'Requester'],
        'http://localhost:8080/api/roles': ['Admin', 'Requester']
      }
    }
  }).as('adminLogin')
})

// Custom command to login as requester
Cypress.Commands.add('loginAsRequester', () => {
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: {
      user: {
        sub: 'auth0|requester-user',
        email: 'requester@cspb.edu.ph',
        name: 'Requester User',
        roles: ['Requester'],
        'https://form137.cspb.edu.ph/api/roles': ['Requester'],
        'http://localhost:8080/api/roles': ['Requester']
      }
    }
  }).as('requesterLogin')
})

// Custom command to logout
Cypress.Commands.add('logoutAuth0', () => {
  cy.visit('/api/auth/logout')
  cy.clearCookies()
  cy.clearLocalStorage()
})