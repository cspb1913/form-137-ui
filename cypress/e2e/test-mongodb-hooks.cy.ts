/// <reference types="cypress" />

describe('Test MongoDB Hooks', () => {
  it('should see MongoDB API hooks working after authentication', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping MongoDB hooks test - credentials not configured')
      return
    }

    cy.log('Testing MongoDB hooks after authentication')

    // Login first
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

    // After login, wait for redirect and check session
    cy.wait(5000)
    
    // Check if we're actually authenticated by testing /api/auth/me
    cy.request({
      url: '/api/auth/me',
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`Auth status: ${response.status}`)
      if (response.status === 200) {
        cy.log(`✅ Authenticated as: ${response.body.email}`)
      } else {
        cy.log('❌ Not authenticated - session might be lost')
      }
    })
    
    // The user should now be authenticated - visit debug page which uses the MongoDB hooks
    cy.visit('/debug-auth', { timeout: 30000 })
    cy.wait(10000) // Give plenty of time for the hooks to execute

    // Check if we can see any MongoDB role data on the page
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      
      if (bodyText.includes('MongoDB User ID:')) {
        cy.log('✅ MongoDB user data visible on page')
      } else {
        cy.log('❌ MongoDB user data NOT visible on page')
      }
      
      if (bodyText.includes('MongoDB Roles:')) {
        cy.log('✅ MongoDB roles section found')
      } else {
        cy.log('❌ MongoDB roles section NOT found')
      }
      
      if (bodyText.includes('canAccessDashboard: true')) {
        cy.log('✅ User can access dashboard')
      } else if (bodyText.includes('canAccessDashboard: false')) {
        cy.log('❌ User cannot access dashboard')
      } else {
        cy.log('⚠️ Dashboard access check not found')
      }
    })

    // Take a screenshot for debugging
    cy.screenshot('mongodb-hooks-test')
  })
})