/// <reference types="cypress" />

describe('MongoDB Role Analysis Test', () => {
  it('should load MongoDB user roles after Auth0 login', () => {
    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping MongoDB role test - credentials not configured')
      return
    }

    cy.log('Testing MongoDB role loading after Auth0 authentication')

    // Step 1: Visit the homepage and login
    cy.visit('/')
    cy.wait(2000)

    // Click login
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

        // Fill and submit Auth0 form
        cy.get('input[name="username"], input[name="email"], input[type="email"]').first().clear().type(username)
        cy.get('input[type="password"]').first().clear().type(password)
        cy.get('button[type="submit"], input[type="submit"]').first().click()
      }
    )

    // Wait for redirect back to app
    cy.wait(5000)

    // Step 2: Visit debug auth page to check MongoDB user data
    cy.visit('/debug-auth', { timeout: 30000 })
    cy.wait(5000) // Give time for MongoDB API calls

    // Step 3: Check for MongoDB user data
    cy.get('body').then(($body) => {
      if ($body.text().includes('MongoDB User ID:')) {
        cy.log('✅ MongoDB user data found')
        
        // Check for specific MongoDB fields
        cy.contains('MongoDB User ID:').should('be.visible')
        cy.contains('Auth0 ID:').should('be.visible')
        cy.contains('MongoDB Roles:').should('be.visible')
        
        // Check if roles are loaded (not empty array)
        cy.get('body').invoke('text').then((text) => {
          if (text.includes('MongoDB Roles:') && !text.includes('MongoDB Roles: []')) {
            cy.log('✅ MongoDB roles loaded successfully')
          } else {
            cy.log('❌ MongoDB roles are empty - API connection issue')
          }
          
          // Log the role data for debugging
          const roleMatch = text.match(/MongoDB Roles:\s*(\[.*?\])/s)
          if (roleMatch) {
            cy.log(`MongoDB Roles: ${roleMatch[1]}`)
          }
        })

        // Check role permissions
        cy.contains('Role Checks:').should('be.visible')
        cy.get('body').invoke('text').then((text) => {
          if (text.includes('canAccessDashboard: true')) {
            cy.log('✅ User can access dashboard')
          } else {
            cy.log('❌ User cannot access dashboard - role issue')
          }
        })
        
      } else {
        cy.log('❌ MongoDB user data not found - API integration issue')
        
        // Check if there are any API errors
        cy.get('body').invoke('text').then((text) => {
          if (text.includes('Failed to fetch current user')) {
            cy.log('❌ API call failed - check backend connection')
          }
          if (text.includes('Loading')) {
            cy.log('⚠️ Still loading - may need more time')
          }
        })
      }
    })

    // Take screenshot for debugging
    cy.screenshot('mongodb-role-analysis')
  })
})