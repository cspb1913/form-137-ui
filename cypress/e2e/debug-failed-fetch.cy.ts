/// <reference types="cypress" />

describe('Debug Failed Fetch Error', () => {
  it('should capture console errors and test API connectivity', () => {
    // Capture console errors before visiting the page
    let consoleErrors = []
    
    cy.window().then((win) => {
      const originalError = win.console.error
      win.console.error = (...args) => {
        consoleErrors.push(args)
        originalError.apply(win.console, args)
      }
    })
    
    // Visit the main page
    cy.visit('/')
    
    // Wait for the page to load and any async operations
    cy.get('body').should('be.visible')
    cy.wait(10000) // Wait for useCurrentUserApi hook to execute
    
    // Check the page content and log it
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      cy.log(`Page content: ${bodyText.substring(0, 500)}...`)
    })
    
    // Test direct API connectivity from browser
    cy.window().then((win) => {
      return new Promise((resolve) => {
        // Test health endpoint
        fetch('http://localhost:8080/api/health/liveness')
          .then(response => {
            cy.log(`✅ Health API: ${response.status}`)
            return response.json()
          })
          .then(data => {
            cy.log('Health data:', data)
            // Test protected endpoint
            return fetch('http://localhost:8080/api/users/me')
          })
          .then(response => {
            cy.log(`Protected API (no auth): ${response.status}`)
            if (response.status === 401) {
              cy.log('✅ Expected 401 for unauth request')
            }
            resolve()
          })
          .catch(error => {
            cy.log('❌ Direct API failed:', error.message)
            win.directApiError = error
            resolve()
          })
      })
    })
    
    // Wait a bit more for any delayed errors
    cy.wait(5000)
    
    // Check all console errors
    cy.window().then(() => {
      if (consoleErrors.length > 0) {
        cy.log(`Found ${consoleErrors.length} console errors:`)
        consoleErrors.forEach((error, index) => {
          cy.log(`Error ${index + 1}:`, JSON.stringify(error))
          
          // Check for fetch-related errors
          const errorStr = JSON.stringify(error)
          if (errorStr.includes('Failed to fetch') || errorStr.includes('Fetch failed')) {
            cy.log(`🔍 FETCH ERROR FOUND: ${errorStr}`)
          }
        })
      } else {
        cy.log('No console errors detected')
      }
    })
  })
})