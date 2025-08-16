/**
 * Auth0 Programmatic Authentication E2E Tests
 * 
 * These tests demonstrate how to use Auth0's programmatic authentication
 * APIs to bypass the Universal Login page for automated testing.
 */

describe('Auth0 Programmatic Authentication', () => {
  
  describe('Resource Owner Password Grant (ROPG)', () => {
    it('should authenticate via ROPG and obtain tokens', () => {
      cy.auth0Login({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD'),
        audience: Cypress.env('AUTH0_AUDIENCE'),
        scope: Cypress.env('AUTH0_SCOPE')
      }).then((tokens) => {
        // Verify we received valid tokens
        expect(tokens).to.have.property('access_token')
        expect(tokens).to.have.property('id_token')
        expect(tokens).to.have.property('expires_in')
        
        // Verify token is valid JWT format
        expect(tokens.access_token.split('.')).to.have.length(3)
        expect(tokens.id_token.split('.')).to.have.length(3)
        
        // Log tokens for debugging (sanitized)
        cy.log('Access Token received:', tokens.access_token.substring(0, 20) + '...')
        cy.log('ID Token received:', tokens.id_token.substring(0, 20) + '...')
      })
    })

    it('should fail with invalid credentials', () => {
      cy.auth0Login({
        username: 'invalid@example.com',
        password: 'wrongpassword',
        audience: Cypress.env('AUTH0_AUDIENCE')
      }).should('be.rejected')
    })

    it('should set session state in browser', () => {
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      }).then((tokens) => {
        // Verify localStorage was set correctly
        cy.window().then((win) => {
          expect(win.localStorage.getItem('auth0.access_token')).to.equal(tokens.access_token)
          expect(win.localStorage.getItem('auth0.id_token')).to.equal(tokens.id_token)
          expect(win.localStorage.getItem('auth0.isAuthenticated')).to.equal('true')
        })
      })
    })
  })

  describe('Protected Route Access', () => {
    it('should access protected route after programmatic authentication', () => {
      // Use programmatic authentication to bypass login UI
      cy.visitAuthenticated('/dashboard', {
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      })
      
      // Verify we're on the dashboard (not redirected to login)
      cy.url().should('include', '/dashboard')
      cy.get('[data-cy="dashboard"]').should('be.visible')
      
      // Verify user data is loaded
      cy.get('[data-cy="user-info"]').should('contain', 'testuser@cspb.edu.ph')
    })

    it('should make authenticated API requests', () => {
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      }).then((tokens) => {
        
        // Make authenticated request to Spring Boot API
        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/requests`,
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`
          }
        }).then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('requests')
        })
      })
    })
  })

  describe('Token Validation and Security', () => {
    it('should validate token structure and claims', () => {
      cy.auth0Login({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD'),
        audience: Cypress.env('AUTH0_AUDIENCE')
      }).then((tokens) => {
        
        // Decode and validate ID token payload
        const idTokenPayload = JSON.parse(atob(tokens.id_token.split('.')[1]))
        
        expect(idTokenPayload).to.have.property('sub')
        expect(idTokenPayload).to.have.property('email', Cypress.env('AUTH0_TEST_USERNAME'))
        expect(idTokenPayload).to.have.property('aud', Cypress.env('AUTH0_CLIENT_ID'))
        expect(idTokenPayload).to.have.property('iss', `https://${Cypress.env('AUTH0_DOMAIN')}/`)
        
        // Verify token is not expired
        const currentTime = Math.floor(Date.now() / 1000)
        expect(idTokenPayload.exp).to.be.greaterThan(currentTime)
        
        // Decode and validate access token
        const accessTokenPayload = JSON.parse(atob(tokens.access_token.split('.')[1]))
        expect(accessTokenPayload).to.have.property('aud', Cypress.env('AUTH0_AUDIENCE'))
        expect(accessTokenPayload).to.have.property('scope')
      })
    })

    it('should handle token expiration gracefully', () => {
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      }).then((tokens) => {
        
        // Simulate expired token by manipulating localStorage
        cy.window().then((win) => {
          const expiredTime = (Date.now() - 3600000).toString() // 1 hour ago
          win.localStorage.setItem('auth0.expires_at', expiredTime)
        })
        
        // Visit protected route
        cy.visit('/dashboard')
        
        // Should redirect to login due to expired token
        cy.url().should('include', '/api/auth/login')
      })
    })
  })

  describe('Multiple User Roles', () => {
    it('should authenticate as admin user', () => {
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_ADMIN_USERNAME'),
        password: Cypress.env('AUTH0_ADMIN_PASSWORD'),
        role: 'admin'
      }).then((tokens) => {
        
        // Verify admin-specific claims in token
        const accessTokenPayload = JSON.parse(atob(tokens.access_token.split('.')[1]))
        
        // Check for admin permissions/roles
        expect(accessTokenPayload.permissions || accessTokenPayload.scope)
          .to.satisfy((perms: string | string[]) => {
            const permArray = typeof perms === 'string' ? perms.split(' ') : perms
            return permArray.some(p => p.includes('admin') || p.includes('Admin'))
          })
      })
    })

    it('should access admin-only routes with admin credentials', () => {
      cy.visitAuthenticated('/admin/requests', {
        username: Cypress.env('AUTH0_ADMIN_USERNAME'),
        password: Cypress.env('AUTH0_ADMIN_PASSWORD'),
        role: 'admin'
      })
      
      cy.url().should('include', '/admin')
      cy.get('[data-cy="admin-dashboard"]').should('be.visible')
    })

    it('should deny admin access to requester users', () => {
      cy.visitAuthenticated('/admin/requests', {
        username: Cypress.env('AUTH0_REQUESTER_USERNAME'),
        password: Cypress.env('AUTH0_REQUESTER_PASSWORD'),
        role: 'requester'
      })
      
      // Should be redirected or see access denied
      cy.url().should('not.include', '/admin')
      cy.get('[data-cy="access-denied"], [data-cy="unauthorized"]')
        .should('be.visible')
        .or(() => {
          // Alternative: redirected to dashboard
          cy.url().should('include', '/dashboard')
        })
    })
  })

  describe('Session Management', () => {
    it('should maintain session across page reloads', () => {
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      })
      
      cy.visit('/dashboard')
      cy.get('[data-cy="user-info"]').should('be.visible')
      
      // Reload page
      cy.reload()
      
      // Session should persist
      cy.get('[data-cy="user-info"]').should('be.visible')
      cy.url().should('include', '/dashboard')
    })

    it('should clear session on logout', () => {
      cy.auth0LoginAndSetSession({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      })
      
      cy.visit('/dashboard')
      
      // Logout
      cy.auth0Logout()
      
      // Verify session is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth0.access_token')).to.be.null
        expect(win.localStorage.getItem('auth0.id_token')).to.be.null
        expect(win.localStorage.getItem('auth0.isAuthenticated')).to.be.null
      })
      
      // Should redirect to login when accessing protected route
      cy.visit('/dashboard')
      cy.url().should('include', '/api/auth/login')
    })
  })

  describe('API Integration Testing', () => {
    beforeEach(() => {
      // Set up API interceptors for testing
      cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/requests`, {
        fixture: 'requests-sample.json'
      }).as('getRequests')
      
      cy.intercept('POST', `${Cypress.env('API_BASE_URL')}/requests`, {
        statusCode: 201,
        body: {
          id: 'req-001',
          ticketNumber: 'F137-2024-001',
          status: 'pending'
        }
      }).as('createRequest')
    })

    it('should submit Form 137 request with authentication', () => {
      cy.visitAuthenticated('/request', {
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      })
      
      // Fill out the form
      cy.fillForm137WithTestData({
        studentName: 'John Doe',
        studentId: '2024-12345',
        program: 'Computer Science',
        purpose: 'Employment'
      })
      
      // Submit form
      cy.get('[data-cy="submit-button"]').click()
      
      // Verify API call was made with authentication
      cy.wait('@createRequest').then((interception) => {
        expect(interception.request.headers).to.have.property('authorization')
        expect(interception.request.headers.authorization).to.match(/Bearer .+/)
      })
      
      // Verify success message
      cy.checkToast('Request submitted successfully', 'success')
    })

    it('should handle API authentication errors', () => {
      // Mock 401 response
      cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/requests`, {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('getRequestsUnauth')
      
      cy.visitAuthenticated('/dashboard', {
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      })
      
      cy.wait('@getRequestsUnauth')
      
      // Should handle auth error gracefully
      cy.get('[data-cy="auth-error"], [data-cy="error-message"]')
        .should('be.visible')
        .and('contain', 'authentication')
    })
  })

  describe('Performance and Reliability', () => {
    it('should authenticate within reasonable time', () => {
      const startTime = Date.now()
      
      cy.auth0Login({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      }).then(() => {
        const authTime = Date.now() - startTime
        expect(authTime).to.be.lessThan(10000) // Should complete within 10 seconds
        cy.log(`Authentication completed in ${authTime}ms`)
      })
    })

    it('should handle network timeouts gracefully', () => {
      // Mock slow Auth0 response
      cy.intercept('POST', `https://${Cypress.env('AUTH0_DOMAIN')}/oauth/token`, {
        delay: 15000, // 15 second delay
        statusCode: 200,
        body: { access_token: 'mock-token', id_token: 'mock-id-token', expires_in: 3600 }
      }).as('slowAuth0')
      
      cy.auth0Login({
        username: Cypress.env('AUTH0_TEST_USERNAME'),
        password: Cypress.env('AUTH0_TEST_PASSWORD')
      }).should('be.rejected')
    })
  })
})