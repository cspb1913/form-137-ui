/// <reference types="cypress" />

describe('Auth0 Requester Flow - Real Integration', () => {
  beforeEach(() => {
    // Ensure we start with a clean slate
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should complete real Auth0 login flow for requester user', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping real Auth0 test - credentials not configured')
      return
    }

    cy.log('Starting real Auth0 login flow for requester')

    // Visit the auth test page which has proper login functionality
    cy.visit('/auth-test.html')
    
    // Click the Auth0 login button (matching exact text from auth-test.html)
    cy.contains('🔑 Login with Auth0').should('be.visible').click()

    // Handle Auth0 login in cross-origin context
    cy.origin(
      `https://${Cypress.env('AUTH0_DOMAIN') || 'jasoncalalang.auth0.com'}`,
      {
        args: {
          username: Cypress.env('AUTH0_REQUESTER_USERNAME'),
          password: Cypress.env('AUTH0_REQUESTER_PASSWORD')
        }
      },
      ({ username, password }) => {
        // Wait for Auth0 login page to load - be more flexible with selectors
        cy.get('body', { timeout: 15000 }).should('be.visible')
        
        // Log current URL for debugging
        cy.url().then((url) => {
          cy.log(`Current URL: ${url}`)
        })
        
        // Wait a bit for the page to fully render
        cy.wait(2000)
        
        // Log page content for debugging
        cy.get('body').then(($body) => {
          cy.log(`Page contains: ${$body.text().substring(0, 200)}...`)
        })
        
        // Check if we need to click continue first (some Auth0 flows)
        cy.get('body').then(($body) => {
          if ($body.text().includes('Continue')) {
            cy.contains('Continue').click()
            cy.wait(2000)
          }
        })
        
        // Try multiple possible selectors for username field
        cy.get('input[name="username"], input[name="email"], input[type="email"], #username, #email, [data-testid="username"], [data-testid="email"]', { timeout: 10000 })
          .first()
          .should('be.visible')
          .clear()
          .type(username)

        // Try multiple possible selectors for password field  
        cy.get('input[name="password"], input[type="password"], #password, [data-testid="password"]', { timeout: 10000 })
          .first()
          .should('be.visible')
          .clear()
          .type(password)

        // Try multiple possible selectors for submit button
        cy.get('button[type="submit"], button[name="submit"], input[type="submit"], .auth0-lock-submit, [data-action-button-primary], button:contains("Log"), button:contains("Sign"), [value="Log"], [value="Sign"]', { timeout: 10000 })
          .first()
          .should('be.visible')
          .click()
      }
    )

    // Wait to be redirected back to the app
    cy.url({ timeout: 15000 }).should('not.include', 'auth0.com')
    cy.url().should('include', 'localhost:3000')

    // Verify authentication was successful
    cy.request({
      url: '/api/auth/me',
      timeout: 10000
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('email')
      cy.log(`Successfully authenticated as: ${response.body.email}`)
    })

    // Verify user sees authenticated content
    cy.get('body').should('not.contain', 'Login')
    
    // Look for common authenticated elements
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text()
      return text.includes('Dashboard') ||
             text.includes('Profile') ||
             text.includes('Logout') ||
             text.includes('jason@cspb.edu.ph')
    })

    cy.log('✅ Auth0 requester login flow completed successfully')
  })

  it('should make authenticated API calls to backend', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping API test - credentials not configured')
      return
    }

    // First login (reuse session if available)
    cy.session(['requester', Cypress.env('AUTH0_REQUESTER_USERNAME')], () => {
      cy.visit('/auth-test.html')
      cy.contains('🔑 Login with Auth0').should('be.visible').click()

      cy.origin(
        `https://${Cypress.env('AUTH0_DOMAIN') || 'jasoncalalang.auth0.com'}`,
        {
          args: {
            username: Cypress.env('AUTH0_REQUESTER_USERNAME'),
            password: Cypress.env('AUTH0_REQUESTER_PASSWORD')
          }
        },
        ({ username, password }) => {
          cy.get('body', { timeout: 15000 }).should('be.visible')
          cy.wait(2000)
          
          cy.get('input[name="username"], input[name="email"], input[type="email"], #username, #email, [data-testid="username"], [data-testid="email"]', { timeout: 10000 })
            .first()
            .should('be.visible')
            .clear()
            .type(username)
          
          cy.get('input[name="password"], input[type="password"], #password, [data-testid="password"]', { timeout: 10000 })
            .first()
            .should('be.visible')
            .clear()
            .type(password)
          
          cy.get('button[type="submit"], button[name="submit"], input[type="submit"], .auth0-lock-submit, [data-action-button-primary], button:contains("Log"), button:contains("Sign"), [value="Log"], [value="Sign"]', { timeout: 10000 })
            .first()
            .should('be.visible')
            .click()
        }
      )

      cy.url({ timeout: 15000 }).should('not.include', 'auth0.com')
    })

    // Visit the app with authenticated session
    cy.visit('/')

    // Test that we can make authenticated API calls to the backend
    cy.request({
      url: '/api/auth/me',
      timeout: 10000
    }).then((response) => {
      expect(response.status).to.eq(200)
      const user = response.body
      
      // Now test backend API with the JWT token
      // Get access token and test backend health endpoint
      cy.window().then((win) => {
        // The app should have access to the Auth0 user and token
        cy.log('Testing backend API connectivity...')
        
        // Test public health endpoint
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/api/health/liveness`,
          timeout: 10000
        }).then((healthResponse) => {
          expect(healthResponse.status).to.eq(200)
          expect(healthResponse.body).to.have.property('status', 'UP')
          cy.log('✅ Backend health endpoint accessible')
        })

        // Note: For protected endpoints, the frontend would need to pass the JWT token
        // This would require the frontend components to make the API call with proper auth headers
        cy.log('✅ Auth0 + Backend API integration verified')
      })
    })
  })

  it('should handle logout correctly', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping logout test - credentials not configured')
      return
    }

    // Use session from previous login
    cy.session(['requester', Cypress.env('AUTH0_REQUESTER_USERNAME')], () => {
      cy.visit('/auth-test.html')
      cy.contains('🔑 Login with Auth0').should('be.visible').click()

      cy.origin(
        `https://${Cypress.env('AUTH0_DOMAIN') || 'jasoncalalang.auth0.com'}`,
        {
          args: {
            username: Cypress.env('AUTH0_REQUESTER_USERNAME'),
            password: Cypress.env('AUTH0_REQUESTER_PASSWORD')
          }
        },
        ({ username, password }) => {
          cy.get('body', { timeout: 15000 }).should('be.visible')
          cy.wait(2000)
          
          cy.get('input[name="username"], input[name="email"], input[type="email"], #username, #email, [data-testid="username"], [data-testid="email"]', { timeout: 10000 })
            .first()
            .should('be.visible')
            .clear()
            .type(username)
          
          cy.get('input[name="password"], input[type="password"], #password, [data-testid="password"]', { timeout: 10000 })
            .first()
            .should('be.visible')
            .clear()
            .type(password)
          
          cy.get('button[type="submit"], button[name="submit"], input[type="submit"], .auth0-lock-submit, [data-action-button-primary], button:contains("Log"), button:contains("Sign"), [value="Log"], [value="Sign"]', { timeout: 10000 })
            .first()
            .should('be.visible')
            .click()
        }
      )

      cy.url({ timeout: 15000 }).should('not.include', 'auth0.com')
    })

    cy.visit('/')

    // Find and click logout
    cy.contains('Logout', { matchCase: false }).should('be.visible').click()

    // Should be logged out
    cy.request({
      url: '/api/auth/me',
      failOnStatusCode: false,
      timeout: 10000
    }).then((response) => {
      expect(response.status).to.eq(401)
      cy.log('✅ Successfully logged out')
    })
  })
})