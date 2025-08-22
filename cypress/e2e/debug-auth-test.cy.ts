/// <reference types="cypress" />

describe('Debug Auth Test', () => {
  it('should test authentication flow via debug-auth endpoint', () => {
    // Visit the debug auth page directly
    cy.visit('http://localhost:3000/debug-auth')
    
    // Wait for the page to load
    cy.get('h1', { timeout: 10000 }).should('contain', 'Auth Debug Page')
    
    // Click the API test button
    cy.get('button').contains('Test API Call').click()
    
    // Wait for the API result
    cy.get('h3', { timeout: 10000 }).should('contain', 'API Result:')
    
    // Take a screenshot of the result
    cy.screenshot('debug-auth-result')
    
    // Check if we got a 401 error as expected
    cy.get('pre').should('be.visible').then(($pre) => {
      const result = $pre.text()
      cy.log('API Result:', result)
      
      // Parse the JSON result
      const apiResult = JSON.parse(result)
      
      // Check if it's a 401 error
      if (apiResult.status === 401) {
        cy.log('Got expected 401 error - authentication not working')
      } else {
        cy.log('Unexpected result - authentication might be working')
      }
    })
  })
})