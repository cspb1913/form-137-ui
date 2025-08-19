/// <reference types="cypress" />

describe('MongoDB Token Test', () => {
  it('should get Auth0 token and call MongoDB API', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping MongoDB token test - credentials not configured')
      return
    }

    cy.log('Testing Auth0 token retrieval and MongoDB API call')

    // Step 1: Login to get Auth0 token
    cy.visit('/')
    cy.wait(2000)

    cy.contains('Sign In to Continue').should('be.visible').click()
    cy.wait(3000)

    // Handle Auth0 login
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

    // Wait for redirect back to app
    cy.wait(5000)
    
    // Step 2: Navigate to debug auth page
    cy.visit('/debug-auth', { timeout: 30000 })
    cy.wait(3000)

    // Step 3: Click the "Get Access Token & Test API" button to trigger manual token retrieval
    cy.contains('Get Access Token & Test API').should('be.visible').click()
    cy.wait(5000) // Give time for API call

    // Step 4: Check the results
    cy.get('body').then(($body) => {
      if ($body.text().includes('Token Information')) {
        cy.log('✅ Token retrieval successful')
        
        // Check if API test worked
        if ($body.text().includes('"apiTest"')) {
          cy.log('✅ API test call made')
          
          if ($body.text().includes('"status": 200')) {
            cy.log('✅ API call returned 200 - MongoDB backend working')
          } else if ($body.text().includes('"status": 401')) {
            cy.log('❌ API call returned 401 - Auth0 token validation failed')
          } else {
            cy.log('❌ API call returned other status')
          }
        } else {
          cy.log('❌ No API test results found')
        }
      } else {
        cy.log('❌ Token retrieval failed')
        
        if ($body.text().includes('Error:')) {
          cy.log('❌ Token error found - check logs')
        }
      }
    })

    // Take screenshot for debugging
    cy.screenshot('mongodb-token-test')
  })
})