// Import commands for component testing
import './commands'

// Import mount command for component testing
import { mount } from 'cypress/react'

// Import global styles for component tests
import '../../app/globals.css'

// Augment the Cypress namespace to include type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Configure component test environment
beforeEach(() => {
  // Set viewport for consistent component testing
  cy.viewport(1280, 720)
})

// Global error handling for component tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore console warnings and non-critical errors
  if (err.message.includes('Warning:') || err.message.includes('console.warn')) {
    return false
  }
  return true
})