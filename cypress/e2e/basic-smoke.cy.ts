/// <reference types="cypress" />

describe('Basic Smoke Test', () => {
  it('should load the application homepage', () => {
    cy.visit('/')
    
    // Take screenshot to see what's actually displayed
    cy.screenshot('homepage-load')
    
    // The page should load without crashing
    cy.get('body').should('exist')
    
    // Check for access denied or unauthorized messages
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      
      // Fail the test if we see access denied, unauthorized, or similar messages
      if (bodyText.includes('Access Denied') || 
          bodyText.includes('Unauthorized') || 
          bodyText.includes('403') || 
          bodyText.includes('401') ||
          bodyText.includes('Access denied') ||
          bodyText.includes('You do not have permission')) {
        throw new Error(`Access denied page detected. Body contains: ${bodyText.substring(0, 500)}`)
      }
    })
    
    // Should have the Form 137 Portal title
    cy.contains('Form 137 Portal').should('be.visible')
    
    // Should have a loading spinner initially or actual content
    cy.get('body').should('not.contain', 'Access Denied')
    cy.get('body').should('not.contain', 'Unauthorized')
  })

  it('should be able to visit the app without errors', () => {
    // Just check that the application loads successfully
    cy.request('/').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.include('Form 137 Portal')
      // Check that response doesn't contain access denied content
      expect(response.body).to.not.include('Access Denied')
      expect(response.body).to.not.include('Unauthorized')
    })
  })

  it('should check authentication flow and user access', () => {
    cy.visit('/')
    
    // Take screenshot of initial load
    cy.screenshot('initial-load')
    
    // Wait for authentication to settle 
    cy.wait(3000)
    
    // Take screenshot after auth processing
    cy.screenshot('after-auth-processing')
    
    // Log current URL to see where we ended up
    cy.url().then((url) => {
      cy.log(`Final URL after auth: ${url}`)
    })
    
    // Check what content is displayed
    cy.get('body').then(($body) => {
      const fullText = $body.text()
      cy.log(`Current page content: ${fullText.substring(0, 300)}...`)
      
      // The page should either show:
      // 1. Login prompt (if not authenticated)
      // 2. Dashboard content (if authenticated with roles)
      // 3. Should NOT show access denied for production mode
      
      const hasLoginPrompt = fullText.includes('Sign In to Continue') || fullText.includes('Welcome Back')
      const hasDashboard = fullText.includes('Dashboard') || fullText.includes('Form 137')
      const hasAccessDenied = fullText.includes('Access Denied')
      
      cy.log(`Has login prompt: ${hasLoginPrompt}`)
      cy.log(`Has dashboard: ${hasDashboard}`)
      cy.log(`Has access denied: ${hasAccessDenied}`)
      
      // Either login prompt OR dashboard should be shown, but NOT access denied
      expect(hasLoginPrompt || hasDashboard).to.be.true
      expect(hasAccessDenied).to.be.false
    })
  })
})