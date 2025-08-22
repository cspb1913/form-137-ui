/// <reference types="cypress" />

// Basic commands for the simplified test suite

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Check if element is visible and contains text
       */
      shouldBeVisibleAndContain(text: string): Chainable<Element>
    }
  }
}

/**
 * Check if element is visible and contains text
 */
Cypress.Commands.add('shouldBeVisibleAndContain', { prevSubject: 'element' }, (subject, text: string) => {
  cy.wrap(subject).should('be.visible').and('contain.text', text)
})