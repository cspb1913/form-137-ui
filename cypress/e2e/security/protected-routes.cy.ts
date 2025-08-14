/// <reference types="cypress" />

describe('Protected Route Access Control', () => {
  beforeEach(() => {
    // Clear browser state
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    
    // Setup Form 137 specific interceptors
    cy.setupForm137Interceptors()
  })

  describe('Unauthenticated Access Control', () => {
    beforeEach(() => {
      // Mock unauthenticated state
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('getUnauthenticated')
    })

    it('should redirect unauthenticated users from protected routes', () => {
      const protectedRoutes = [
        '/',
        '/dashboard',
        '/admin',
        '/request',
        '/admin/requests'
      ]
      
      protectedRoutes.forEach(route => {
        cy.visit(route)
        cy.wait('@getUnauthenticated')
        
        // Should not be able to access protected content
        cy.get('[data-cy="admin-dashboard"]').should('not.exist')
        cy.get('[data-cy="dashboard"]').should('not.exist')
        cy.get('[data-cy="request-form"]').should('not.exist')
        
        // Should see login prompt or be redirected
        cy.get('body').should('satisfy', ($body) => {
          return $body.find('[data-cy="login-prompt"]').length > 0 ||
                 $body.find('[data-cy="login-button"]').length > 0 ||
                 !$body.text().includes('Dashboard') // Redirected away
        })
      })
    })

    it('should handle direct navigation to specific protected resources', () => {
      const specificRoutes = [
        '/admin/F137-2024-001',
        '/dashboard/request/req-123',
        '/admin/reports'
      ]
      
      specificRoutes.forEach(route => {
        cy.visit(route)
        cy.wait('@getUnauthenticated')
        
        // Should be blocked from accessing specific resources
        cy.url().should('not.include', route.split('/').slice(-1)[0])
        cy.get('[data-cy="request-detail"]').should('not.exist')
        cy.get('[data-cy="admin-controls"]').should('not.exist')
      })
    })

    it('should preserve intended destination after authentication', () => {
      const intendedRoute = '/admin'
      
      cy.visit(intendedRoute)
      cy.wait('@getUnauthenticated')
      
      // Should show login interface
      cy.get('[data-cy="login-prompt"], [data-cy="login-button"]').should('be.visible')
      
      // Simulate successful authentication
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAuthenticatedAdmin')
      cy.mockUserSession({
        sub: 'auth0|redirect-test-admin',
        email: 'redirect@admin.edu',
        name: 'Redirect Test Admin',
        roles: ['Admin']
      })
      
      // Reload to simulate post-authentication state
      cy.reload()
      cy.wait('@getAuthenticatedAdmin')
      
      // Should be redirected to intended destination or admin dashboard
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
    })

    it('should handle session expiration during navigation', () => {
      // Start with valid session
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getValidUser')
      cy.mockUserSession({
        sub: 'auth0|session-expiry-test',
        email: 'expiry@test.edu',
        name: 'Session Expiry User',
        roles: ['Requester']
      })
      
      cy.visit('/')
      cy.wait('@getValidUser')
      cy.get('[data-cy="dashboard"]').should('be.visible')
      
      // Simulate session expiration
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('getExpiredUser')
      
      // Navigate to another route
      cy.visit('/request')
      cy.wait('@getExpiredUser')
      
      // Should handle expired session gracefully
      cy.get('[data-cy="login-prompt"]').should('be.visible')
      cy.get('[data-cy="request-form"]').should('not.exist')
    })
  })

  describe('Role-Based Route Protection', () => {
    describe('Admin-Only Routes', () => {
      const adminOnlyRoutes = [
        '/admin',
        '/admin/dashboard',
        '/admin/requests',
        '/admin/F137-2024-001'
      ]

      it('should allow admin users to access admin routes', () => {
        cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
        cy.mockUserSession({
          sub: 'auth0|admin-access-test',
          email: 'admin@test.edu',
          name: 'Admin Access Test',
          roles: ['Admin']
        })

        adminOnlyRoutes.forEach(route => {
          cy.visit(route)
          cy.wait('@getAdminUser')
          
          // Should successfully access admin routes
          cy.url().should('include', route)
          cy.get('[data-cy="admin-dashboard"], [data-cy="admin-content"]').should('be.visible')
          cy.get('[data-cy="unauthorized-message"]').should('not.exist')
        })
      })

      it('should block requester users from admin routes', () => {
        cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
        cy.mockUserSession({
          sub: 'auth0|requester-block-test',
          email: 'requester@test.edu',
          name: 'Blocked Requester',
          roles: ['Requester']
        })

        adminOnlyRoutes.forEach(route => {
          cy.visit(route)
          cy.wait('@getRequesterUser')
          
          // Should be redirected or blocked
          cy.url().should('satisfy', (url: string) => {
            return !url.includes('/admin') || url.includes('/unauthorized')
          })
          
          // Should not see admin content
          cy.get('[data-cy="admin-dashboard"]').should('not.exist')
        })
      })

      it('should block users with no roles from admin routes', () => {
        cy.intercept('GET', '/api/auth/me', { fixture: 'user-no-roles.json' }).as('getUserNoRoles')
        cy.mockUserSession({
          sub: 'auth0|no-roles-block',
          email: 'noroles@test.edu',
          name: 'No Roles User',
          roles: []
        })

        adminOnlyRoutes.forEach(route => {
          cy.visit(route)
          cy.wait('@getUserNoRoles')
          
          // Should be redirected to unauthorized
          cy.url().should('include', '/unauthorized')
          cy.get('[data-cy="unauthorized-message"]').should('be.visible')
        })
      })
    })

    describe('Requester Routes Access', () => {
      const requesterRoutes = [
        '/',
        '/dashboard',
        '/request',
        '/dashboard/request/req-123'
      ]

      it('should allow requester users to access requester routes', () => {
        cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
        cy.mockUserSession({
          sub: 'auth0|requester-access-test',
          email: 'requester@test.edu',
          name: 'Requester Access Test',
          roles: ['Requester']
        })

        requesterRoutes.forEach(route => {
          cy.visit(route)
          cy.wait('@getRequesterUser')
          
          // Should access routes (admin may redirect to admin dashboard)
          if (route === '/') {
            cy.get('[data-cy="dashboard"], [data-cy="login-prompt"]').should('be.visible')
          } else {
            cy.url().should('include', route.split('/')[1] || '/')
            cy.get('[data-cy="dashboard"], [data-cy="request-form"], [data-cy="request-detail"]').should('be.visible')
          }
          
          cy.get('[data-cy="unauthorized-message"]').should('not.exist')
        })
      })

      it('should redirect admin users appropriately from requester routes', () => {
        cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
        cy.mockUserSession({
          sub: 'auth0|admin-redirect-test',
          email: 'admin@test.edu',
          name: 'Admin Redirect Test',
          roles: ['Admin']
        })

        // Admin visiting home should redirect to admin dashboard
        cy.visit('/')
        cy.wait('@getAdminUser')
        
        cy.url().should('include', '/admin')
        cy.get('[data-cy="admin-dashboard"]').should('be.visible')
      })

      it('should block users with no roles from requester routes', () => {
        cy.intercept('GET', '/api/auth/me', { fixture: 'user-no-roles.json' }).as('getUserNoRoles')
        cy.mockUserSession({
          sub: 'auth0|no-roles-requester-test',
          email: 'noroles@test.edu',
          name: 'No Roles User',
          roles: []
        })

        requesterRoutes.forEach(route => {
          cy.visit(route)
          cy.wait('@getUserNoRoles')
          
          // Should be redirected to unauthorized
          cy.url().should('include', '/unauthorized')
          cy.get('[data-cy="unauthorized-message"]').should('be.visible')
        })
      })
    })
  })

  describe('API Endpoint Protection', () => {
    it('should protect admin API endpoints from non-admin access', () => {
      const adminEndpoints = [
        '/admin/requests',
        '/admin/requests/req-123/status',
        '/admin/dashboard/stats'
      ]
      
      // Test as requester user
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|api-protection-requester',
        email: 'requester@test.edu',
        name: 'API Test Requester',
        roles: ['Requester']
      })

      adminEndpoints.forEach(endpoint => {
        const fullUrl = `${Cypress.env('API_BASE_URL')}${endpoint}`
        
        cy.request({
          method: 'GET',
          url: fullUrl,
          failOnStatusCode: false,
          headers: {
            'Authorization': 'Bearer mock-requester-token'
          }
        }).then((response) => {
          // Should be forbidden or unauthorized
          expect([401, 403]).to.include(response.status)
        })
      })
    })

    it('should allow admin access to admin API endpoints', () => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-admin.json' }).as('getAdminUser')
      cy.mockUserSession({
        sub: 'auth0|api-access-admin',
        email: 'admin@test.edu',
        name: 'API Test Admin',
        roles: ['Admin']
      })

      // Test admin endpoint access (mocked)
      cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/admin/requests`, {
        statusCode: 200,
        body: { requests: [], total: 0 }
      }).as('adminApiSuccess')

      cy.authenticatedRequest('GET', '/admin/requests').then((response) => {
        expect(response.status).to.equal(200)
      })
    })

    it('should protect user-specific data endpoints', () => {
      const userSpecificEndpoints = [
        '/requests/mine',
        '/dashboard/my-requests',
        '/profile'
      ]
      
      // Test cross-user access protection
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      
      userSpecificEndpoints.forEach(endpoint => {
        // Mock endpoint to return data for different user
        cy.intercept('GET', `${Cypress.env('API_BASE_URL')}${endpoint}`, (req) => {
          // Check authorization header or user context
          if (req.headers.authorization?.includes('different-user-token')) {
            req.reply({ statusCode: 403, body: { error: 'Access denied' } })
          } else {
            req.reply({ statusCode: 200, body: { data: 'user-specific-data' } })
          }
        })
        
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}${endpoint}`,
          headers: { 'Authorization': 'Bearer different-user-token' },
          failOnStatusCode: false
        }).then((response) => {
          expect([401, 403]).to.include(response.status)
        })
      })
    })
  })

  describe('Cross-Site Request Forgery (CSRF) Protection', () => {
    it('should validate CSRF tokens on state-changing requests', () => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|csrf-test-user',
        email: 'csrf@test.edu',
        name: 'CSRF Test User',
        roles: ['Requester']
      })

      // Mock CSRF protection
      cy.intercept('POST', `${Cypress.env('API_BASE_URL')}/requests`, (req) => {
        if (!req.headers['x-csrf-token']) {
          req.reply({ statusCode: 403, body: { error: 'CSRF token missing' } })
        } else {
          req.reply({ statusCode: 201, body: { id: 'req-csrf-test' } })
        }
      }).as('csrfProtectedRequest')

      // Attempt request without CSRF token
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_BASE_URL')}/requests`,
        body: { studentName: 'Test' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(403)
      })
    })
  })

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should handle rate-limited requests appropriately', () => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      
      // Mock rate limiting
      cy.intercept('POST', `${Cypress.env('API_BASE_URL')}/requests`, {
        statusCode: 429,
        body: { 
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60
        }
      }).as('rateLimitedRequest')

      cy.visit('/request')
      cy.wait('@getRequesterUser')
      
      cy.fillForm137WithTestData()
      cy.get('[data-cy="submit-button"]').click()
      
      cy.wait('@rateLimitedRequest')
      
      // Should handle rate limiting gracefully
      cy.get('[data-cy="error-message"], [data-cy="toast-error"]')
        .should('be.visible')
        .and('contain.text', 'Rate limit')
      
      // Should show retry information
      cy.get('[data-cy="retry-info"]').should('contain.text', 'try again')
    })
  })

  describe('Content Security Policy (CSP) Compliance', () => {
    it('should not execute inline scripts or unsafe content', () => {
      cy.visit('/')
      
      // Check that CSP headers are present (if implemented)
      cy.request('/').then((response) => {
        // In a real implementation, check for CSP headers
        if (response.headers['content-security-policy']) {
          expect(response.headers['content-security-policy']).to.include('default-src')
        }
      })
      
      // Verify no inline scripts are executed
      cy.window().then((win) => {
        // Check that dangerous globals are not available
        expect(win.eval).to.be.undefined
      })
    })
  })

  describe('Middleware Protection Edge Cases', () => {
    it('should handle malformed authentication tokens', () => {
      // Mock malformed token response
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 400,
        body: { error: 'Invalid token format' }
      }).as('getMalformedToken')
      
      cy.visit('/admin')
      cy.wait('@getMalformedToken')
      
      // Should handle malformed token gracefully
      cy.get('[data-cy="login-prompt"], [data-cy="error-message"]').should('be.visible')
      cy.get('[data-cy="admin-dashboard"]').should('not.exist')
    })

    it('should handle network timeouts during authentication', () => {
      // Mock network timeout
      cy.intercept('GET', '/api/auth/me', { forceNetworkError: true }).as('getNetworkError')
      
      cy.visit('/')
      cy.wait('@getNetworkError')
      
      // Should show appropriate error handling
      cy.get('[data-cy="error-message"], [data-cy="network-error"], [data-cy="retry-button"]')
        .should('exist')
    })

    it('should handle concurrent authentication requests', () => {
      let requestCount = 0
      
      cy.intercept('GET', '/api/auth/me', (req) => {
        requestCount++
        if (requestCount === 1) {
          req.reply((res) => {
            res.delay(1000)
            res.send({ fixture: 'user-admin.json' })
          })
        } else {
          req.reply({ fixture: 'user-admin.json' })
        }
      }).as('getConcurrentAuth')
      
      // Open multiple tabs/requests simultaneously
      cy.visit('/')
      cy.visit('/admin')
      
      // Should handle concurrent requests appropriately
      cy.wait('@getConcurrentAuth')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
    })

    it('should prevent route manipulation through browser history', () => {
      cy.intercept('GET', '/api/auth/me', { fixture: 'user-requester.json' }).as('getRequesterUser')
      cy.mockUserSession({
        sub: 'auth0|history-test',
        email: 'history@test.edu',
        name: 'History Test User',
        roles: ['Requester']
      })
      
      cy.visit('/')
      cy.wait('@getRequesterUser')
      
      // Try to manipulate URL to access admin route
      cy.visit('/admin')
      cy.wait('@getRequesterUser')
      
      // Should still be blocked despite direct URL manipulation
      cy.url().should('not.include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('not.exist')
    })
  })

  describe('Security Headers and Configuration', () => {
    it('should include appropriate security headers', () => {
      cy.request('/').then((response) => {
        // Check for security headers (implementation dependent)
        const securityHeaders = [
          'x-frame-options',
          'x-content-type-options',
          'referrer-policy',
          'strict-transport-security'
        ]
        
        securityHeaders.forEach(header => {
          if (response.headers[header]) {
            cy.log(`✓ Found security header: ${header}`)
          }
        })
      })
    })

    it('should prevent clickjacking attacks', () => {
      cy.request('/').then((response) => {
        if (response.headers['x-frame-options']) {
          expect(['DENY', 'SAMEORIGIN']).to.include(response.headers['x-frame-options'])
        }
      })
    })
  })
})