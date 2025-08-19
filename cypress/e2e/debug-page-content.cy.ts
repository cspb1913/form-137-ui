/// <reference types="cypress" />

describe('Debug Page Content', () => {
  it('should show what content is actually visible on homepage', () => {
    cy.visit('/')
    cy.wait(5000) // Wait for page to fully load
    
    // Log the entire page text content
    cy.get('body').invoke('text').then((text) => {
      cy.log(`Page text content: ${text}`)
    })
    
    // Check for specific elements
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-prompt"]').length > 0) {
        cy.log('Login prompt found')
      }
      if ($body.find('button:contains("Sign In")').length > 0) {
        cy.log('Sign In button found')
      }
      if ($body.find('.animate-spin').length > 0) {
        cy.log('Loading spinner found')
      }
      if ($body.text().includes('Sign In to Continue')) {
        cy.log('Sign In to Continue text found')
      } else {
        cy.log('Sign In to Continue text NOT found')
      }
    })
    
    // Take a screenshot for debugging
    cy.screenshot('homepage-content')
  })
})