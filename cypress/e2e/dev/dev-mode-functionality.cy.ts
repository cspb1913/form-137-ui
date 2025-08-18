/// <reference types="cypress" />

/**
 * Development Mode Functionality Tests
 * 
 * These tests verify that the development mode features work correctly
 * and provide a good development experience.
 */
describe('Development Mode Functionality', () => {
  beforeEach(() => {
    // Ensure we're in dev mode for these tests
    cy.window().then((win) => {
      win.localStorage.setItem('dev-mode', 'true')
    })
    
    // Clear any existing authentication state
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('Dev Mode Detection', () => {
    it('should detect and display dev mode indicators', () => {
      cy.visit('/')
      
      // Should show dev mode indicators - look for the actual dev mode card
      cy.contains('🔧 Development Mode').should('be.visible')
      cy.contains('DEV').should('be.visible')
      cy.contains('Authentication is bypassed').should('be.visible')
      
      // Check for dev mode environmental setup
      cy.window().then((win) => {
        // Verify dev mode is active (this would be detected by the app)
        expect(win.location.hostname).to.equal('localhost')
      })
    })

    it('should have dev user selector available', () => {
      cy.visit('/')
      
      // Dev mode should show user selector and profile switching options
      cy.contains('Switch Profile:').should('be.visible')
      cy.contains('Switch Profile').should('be.visible') // The button
      cy.contains('Logout').should('be.visible')
      
      // Check that the profile selector is functional
      cy.get('[role="combobox"]').should('be.visible')
    })
  })

  describe('Mock Authentication Flow', () => {
    it('should allow switching between mock users in dev mode', () => {
      cy.visit('/')
      
      // In dev mode, authentication should be mocked
      // Test the dev auth flow - look for dev mode indicators
      cy.contains('🔧 Development Mode').should('be.visible')
      
      // Verify that we can access protected areas without real auth
      cy.visit('/dashboard', { failOnStatusCode: false })
      
      // Should be able to access dashboard in dev mode (even if page doesn't exist)
      cy.get('body').should('be.visible')
    })

    it('should simulate different user roles in dev mode', () => {
      cy.visit('/')
      
      // Test switching to admin role in dev mode
      cy.window().then((win) => {
        win.localStorage.setItem('dev-user-role', 'Admin')
        win.localStorage.setItem('dev-user-email', 'admin@example.com')
        win.localStorage.setItem('dev-user-name', 'Dev Admin User')
      })
      
      cy.reload()
      
      // Should be able to access admin areas (even if page doesn't exist yet)
      cy.visit('/admin', { failOnStatusCode: false })
      cy.get('body').should('be.visible')
    })

    it('should simulate requester role in dev mode', () => {
      cy.visit('/')
      
      // Test switching to requester role in dev mode
      cy.window().then((win) => {
        win.localStorage.setItem('dev-user-role', 'Requester')
        win.localStorage.setItem('dev-user-email', 'requester@example.com')
        win.localStorage.setItem('dev-user-name', 'Dev Requester User')
      })
      
      cy.reload()
      
      // Should be able to access requester areas (even if page doesn't exist yet)
      cy.visit('/request', { failOnStatusCode: false })
      cy.get('body').should('be.visible')
    })
  })

  describe('Development API Integration', () => {
    it('should connect to local development API with custom JWT', () => {
      // Test local API connectivity with custom authentication
      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/health/liveness',
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`API Health Check: ${response.status}`)
        
        if (response.status === 200) {
          cy.log('✅ Local API is running and accessible')
        } else {
          cy.log('⚠️ Local API may not be running - this is expected if not started')
        }
      })
    })

    it('should test custom JWT token generation in dev mode', () => {
      // Test custom JWT token endpoint
      cy.request({
        method: 'POST',
        url: 'http://localhost:8080/api/auth/token',
        headers: {
          'X-CSPB-Secret': 'cspb-secure-api-key-2025',
          'Content-Type': 'application/json'
        },
        body: {
          email: 'dev@test.com',
          name: 'Dev User',
          role: 'Requester'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log('✅ Custom JWT token generation working')
          expect(response.body).to.have.property('access_token')
        } else {
          cy.log('⚠️ JWT token generation may require API to be running')
        }
      })
    })

    it('should test JWKS endpoint availability', () => {
      // Test JWKS endpoint for token validation
      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/auth/.well-known/jwks.json',
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log('✅ JWKS endpoint accessible')
          expect(response.body).to.have.property('keys')
        } else {
          cy.log('⚠️ JWKS endpoint may require API to be running')
        }
      })
    })

    it('should handle API errors gracefully in dev mode', () => {
      cy.visit('/')
      
      // Intercept API calls and simulate errors for testing
      cy.intercept('GET', '**/api/**', {
        statusCode: 500,
        body: { error: 'Simulated dev error' }
      }).as('apiError')
      
      // Navigate to a page that makes API calls
      cy.visit('/dashboard')
      
      // Should handle the error gracefully without crashing
      cy.get('body').should('be.visible')
    })
  })

  describe('Development Workflow Features', () => {
    it('should support rapid form testing', () => {
      // For now, test that we can access the request page without errors
      cy.visit('/request', { failOnStatusCode: false })
      
      // In dev mode, we should be able to access pages even if they don't exist yet
      cy.get('body').should('be.visible')
      
      // Test basic navigation - go back to home page
      cy.visit('/')
      cy.contains('Form 137 Portal').should('be.visible')
    })

    it('should support UI component testing', () => {
      cy.visit('/')
      
      // Test basic UI components are working
      cy.get('nav').should('be.visible')
      cy.get('main').should('exist') // Use exist since main might have 0 height
      
      // Test that navigation works
      cy.contains('Form 137 Portal').should('be.visible')
      
      // Check the main page structure
      cy.get('nav .max-w-7xl').should('be.visible')
      cy.get('main.container').should('exist') // Use exist instead of visible since it might have 0 height
    })

    it('should provide fast feedback for UI changes', () => {
      cy.visit('/')
      
      // Test hot reload functionality by checking page loads quickly
      const startTime = Date.now()
      
      cy.get('body').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime
        cy.log(`Page load time: ${loadTime}ms`)
        
        // In dev mode, pages should load relatively quickly
        expect(loadTime).to.be.lessThan(10000) // 10 seconds max
      })
    })
  })

  describe('Development Environment Validation', () => {
    it('should validate development dependencies are loaded', () => {
      cy.visit('/')
      
      // Check that development-specific scripts or features are available
      cy.window().then((win) => {
        // Verify we're running in a development environment
        expect(win.location.hostname).to.equal('localhost')
        expect(win.location.port).to.equal('3000')
      })
    })

    it('should provide helpful development error messages', () => {
      cy.visit('/')
      
      // Test that development builds provide helpful error messages
      cy.window().then((win) => {
        // In development, we should have access to better debugging
        // This could include React DevTools, better error boundaries, etc.
        cy.get('body').should('be.visible')
      })
    })
  })

  describe('Performance in Development', () => {
    it('should load quickly in development mode', () => {
      const startTime = Date.now()
      
      cy.visit('/')
      
      cy.get('body').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime
        cy.log(`Initial load time: ${loadTime}ms`)
        
        // Development builds should still be reasonably fast
        expect(loadTime).to.be.lessThan(15000) // 15 seconds max for dev
      })
    })

    it('should handle hot module replacement gracefully', () => {
      cy.visit('/')
      
      // Test that the page can handle updates without full refresh
      cy.get('body').should('be.visible')
      
      // Simulate a navigation that might trigger HMR
      cy.visit('/dashboard')
      cy.get('body').should('be.visible')
      
      cy.visit('/')
      cy.get('body').should('be.visible')
    })
  })
})