// Import commands.js using ES2015 syntax:
import './commands'

// Configure global test behavior
beforeEach(() => {
  // Clear browser state before each test
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Set viewport to ensure consistent testing
  cy.viewport(1280, 720)
})

// Add global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore ResizeObserver loop errors (common in React apps)
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  
  // Ignore hydration mismatches in development
  if (err.message.includes('Hydration failed')) {
    return false
  }
  
  // Ignore network errors during navigation
  if (err.message.includes('NetworkError') || err.message.includes('Loading chunk')) {
    return false
  }
  
  // Let other errors fail the test
  return true
})