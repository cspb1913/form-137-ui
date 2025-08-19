/// <reference types="cypress" />

describe('Auth State Debug', () => {
  it('should monitor Auth0 state changes after authentication', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping auth state debug - credentials not configured')
      return
    }

    cy.log('Testing Auth0 state persistence after authentication')

    // Step 1: Login first
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

    // Step 2: Wait for callback and check auth
    cy.wait(5000)
    
    // Check auth status via API
    cy.request({
      url: '/api/auth/me',
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`Auth API status: ${response.status}`)
      if (response.status === 200) {
        cy.log(`✅ Server sees authenticated user: ${response.body.email}`)
      } else {
        cy.log('❌ Server does not see authenticated user')
        return // Exit early if not authenticated
      }
    })

    // Step 3: Visit the auth state test page
    cy.visit('/auth-state-test', { timeout: 30000 })
    cy.wait(3000)

    // Step 4: Monitor the state for up to 15 seconds
    let currentState = { user: false, loading: true, time: 0 }
    
    for (let i = 0; i < 15; i++) {
      cy.wait(1000)
      cy.get('body').then(($body) => {
        const bodyText = $body.text()
        
        const hasUser = bodyText.includes('User: ✅ Present')
        const isLoading = bodyText.includes('Loading: 🔄 True')
        const timeMatch = bodyText.match(/Time since mount: ([\d.]+)s/)
        const time = timeMatch ? parseFloat(timeMatch[1]) : 0
        
        const newState = { user: hasUser, loading: isLoading, time }
        
        if (newState.user !== currentState.user || newState.loading !== currentState.loading) {
          cy.log(`🔄 State changed at ${time}s: user=${hasUser}, loading=${isLoading}`)
          currentState = newState
        }
        
        // If we have user and not loading, we're done
        if (hasUser && !isLoading) {
          cy.log('✅ Auth0 user state successfully loaded!')
          return false // Break the loop
        }
        
        // If we're not loading but still no user after 10 seconds, it's a problem
        if (!isLoading && !hasUser && time > 10) {
          cy.log('❌ Auth0 user state failed to load - not loading but no user')
          return false // Break the loop
        }
      })
    }

    // Final state check
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      const hasUser = bodyText.includes('User: ✅ Present')
      const isLoading = bodyText.includes('Loading: 🔄 True')
      
      if (hasUser && !isLoading) {
        cy.log('✅ Final state: Auth0 user properly loaded')
      } else if (!hasUser && !isLoading) {
        cy.log('❌ Final state: Auth0 user failed to load (not loading, no user)')
      } else if (isLoading) {
        cy.log('⚠️ Final state: Still loading after 15 seconds')
      }
    })

    // Test the manual API check button
    cy.contains('Check /api/auth/me').click()
    cy.wait(1000)

    // Take screenshot for debugging
    cy.screenshot('auth-state-debug')
  })
})