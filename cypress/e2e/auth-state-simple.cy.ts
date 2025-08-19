/// <reference types="cypress" />

describe('Simple Auth State Test', () => {
  it('should detect when Auth0 user loads after authentication', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping auth state test - credentials not configured')
      return
    }

    cy.log('Testing simple Auth0 state detection')

    // Step 1: Start by visiting debug page to establish session if exists
    cy.visit('/debug-auth')
    cy.wait(3000)

    // Check if already authenticated
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      
      if (bodyText.includes('MongoDB User ID:') && !bodyText.includes('Not loaded')) {
        cy.log('✅ Already authenticated with MongoDB user data')
        return
      }
      
      if (bodyText.includes('Please log in')) {
        cy.log('Need to authenticate - starting login flow')
        
        // Click login and authenticate
        cy.contains('Login').click()
        cy.wait(3000)

        cy.origin(
          `https://${Cypress.env('AUTH0_DOMAIN') || 'jasoncalalang.auth0.com'}`,
          {
            args: {
              username: Cypress.env('AUTH0_REQUESTER_USERNAME'),
              password: Cypress.env('AUTH0_REQUESTER_PASSWORD')
            }
          },
          ({ username, password }) => {
            cy.get('body', { timeout: 20000 }).should('be.visible')
            cy.wait(3000)

            cy.get('input[name="username"], input[name="email"], input[type="email"]').first().clear().type(username)
            cy.get('input[type="password"]').first().clear().type(password)
            cy.get('button[type="submit"], input[type="submit"]').first().click()
          }
        )

        // Wait for callback
        cy.wait(5000)
      }
    })

    // Step 2: Now visit debug page and wait for MongoDB data
    cy.visit('/debug-auth', { timeout: 30000 })
    
    // Wait up to 30 seconds for MongoDB user data to appear
    cy.get('body', { timeout: 30000 }).should(($body) => {
      const bodyText = $body.text()
      
      // Should see MongoDB user data
      expect(bodyText).to.include('MongoDB User ID:')
      
      // Should NOT see "Not loaded"
      expect(bodyText).to.not.include('MongoDB User ID: Not loaded')
    })

    // Verify we can see some user data
    cy.contains('MongoDB User ID:').should('be.visible')
    cy.contains('Auth0 ID:').should('be.visible')
    
    cy.log('✅ MongoDB user data successfully loaded!')
    cy.screenshot('auth-state-simple-success')
  })
})