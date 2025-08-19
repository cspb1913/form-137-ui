/// <reference types="cypress" />

describe('Direct API Test', () => {
  it('should test MongoDB API directly with Auth0 token', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping direct API test - credentials not configured')
      return
    }

    cy.log('Testing direct MongoDB API call with Auth0 token')

    // Step 1: Login to get Auth0 session
    cy.visit('/')
    cy.wait(2000)

    cy.contains('Sign In to Continue').should('be.visible').click()
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

    // Step 2: After login, get access token and test API directly
    cy.wait(5000)
    
    // Visit a page to establish session, then use window methods to get token
    cy.visit('/', { timeout: 30000 })
    cy.wait(3000)

    // Step 3: Use the browser's built-in fetch to test the API
    cy.window().then((win) => {
      // Try to get Auth0 access token using the browser context
      cy.request({
        method: 'GET',
        url: '/api/auth/me',
        failOnStatusCode: false
      }).then((authResponse) => {
        cy.log(`Auth check status: ${authResponse.status}`)
        
        if (authResponse.status === 200) {
          cy.log('✅ Auth0 session is valid')
          cy.log(`User: ${authResponse.body.email}`)
          
          // Now try to get an access token and call MongoDB API
          cy.window().then(async (window) => {
            try {
              // This should work if we're in an authenticated context
              const response = await window.fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  audience: 'https://form137.cspb.edu.ph/api'
                })
              })
              
              if (response.ok) {
                const tokenData = await response.json()
                cy.log('✅ Got access token')
                
                // Now test the MongoDB API directly
                const apiResponse = await window.fetch('http://localhost:8080/api/users/me', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json'
                  }
                })
                
                cy.log(`MongoDB API status: ${apiResponse.status}`)
                
                if (apiResponse.ok) {
                  const userData = await apiResponse.json()
                  cy.log('✅ MongoDB API successful')
                  cy.log(`MongoDB User: ${userData.email}`)
                  cy.log(`MongoDB Roles: ${JSON.stringify(userData.roles)}`)
                } else {
                  cy.log(`❌ MongoDB API failed: ${apiResponse.status}`)
                  const errorText = await apiResponse.text()
                  cy.log(`Error: ${errorText}`)
                }
              } else {
                cy.log('❌ Failed to get access token')
              }
            } catch (error) {
              cy.log(`❌ Error in API test: ${error}`)
            }
          })
        } else {
          cy.log('❌ Auth0 session not valid')
        }
      })
    })

    // Take screenshot for debugging
    cy.screenshot('direct-api-test')
  })
})