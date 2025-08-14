/// <reference types="cypress" />

describe('Basic Smoke Test', () => {
  it('should load the application homepage', () => {
    cy.visit('/')
    
    // The page should load without crashing
    cy.get('body').should('exist')
    
    // Should have the Form 137 Portal title
    cy.contains('Form 137 Portal').should('be.visible')
    
    // Should have a loading spinner initially
    cy.get('.animate-spin').should('be.visible')
  })

  it('should be able to visit the app without errors', () => {
    // Just check that the application loads successfully
    cy.request('/').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.include('Form 137 Portal')
    })
  })

  it('should have proper page structure', () => {
    cy.visit('/')
    
    // Check basic page structure
    cy.get('nav').should('be.visible')
    cy.get('main').should('be.visible')
    
    // Should not have console errors that would indicate major issues
    cy.window().then((win) => {
      // This is just a basic check - in a real test you might capture console.error
      expect(win.document.title).to.include('Form 137')
    })
  })
})