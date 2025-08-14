// Import commands.js using ES2015 syntax:
import './commands'

// Import coverage plugin to support code coverage
import '@cypress/code-coverage/support'

// Hide fetch/XHR requests in command log unless explicitly needed
const app = window.top
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }'
  style.setAttribute('data-hide-command-log-request', '')
  app.document.head.appendChild(style)
}

// Configure global test behavior
beforeEach(() => {
  // Clear browser state before each test
  cy.clearLocalStorage()
  cy.clearCookies()
  cy.clearAllSessionStorage()
  
  // Set viewport to ensure consistent testing
  cy.viewport(1280, 720)
  
  // Set up common API interceptors for all tests
  cy.setupCommonInterceptors()
  
  // Verify API connectivity at start of each test suite
  if (Cypress.currentTest.title.includes('API')) {
    cy.task('checkApiHealth').then((result: any) => {
      if (result.status !== 200) {
        cy.log(`API Health Check Warning: ${result.message}`)
      }
    })
  }
})

// Add global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific Auth0 errors that don't affect functionality
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  
  // Ignore network errors during navigation
  if (err.message.includes('NetworkError') || err.message.includes('Loading chunk')) {
    return false
  }
  
  // Ignore ResizeObserver loop errors (common in React apps)
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  
  // Ignore hydration mismatches in development
  if (err.message.includes('Hydration failed') && Cypress.env('NODE_ENV') !== 'production') {
    return false
  }
  
  // Let other errors fail the test
  return true
})

// Add custom Cypress commands to global namespace
declare global {
  namespace Cypress {
    interface Chainable {
      setupCommonInterceptors(): Chainable<void>
      shouldBeVisibleAndContain(text: string): Chainable<JQuery<HTMLElement>>
      shouldBeOnPage(path: string): Chainable<void>
      checkToast(message: string, type?: 'success' | 'error'): Chainable<void>
    }
  }
}

// Custom utility commands
Cypress.Commands.add('setupCommonInterceptors', () => {
  // Default unauthenticated state
  cy.intercept('GET', '/api/auth/me', { 
    statusCode: 401, 
    body: { error: 'Unauthorized' }
  }).as('getUserUnauthenticated')
  
  // API health check
  cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/health`, {
    statusCode: 200,
    body: { status: 'healthy', timestamp: new Date().toISOString() }
  }).as('apiHealth')
  
  // Common API endpoints with default responses
  cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/requests**`, {
    statusCode: 200,
    body: { requests: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  }).as('getRequests')
  
  cy.intercept('POST', `${Cypress.env('API_BASE_URL')}/requests`, {
    statusCode: 201,
    body: { 
      id: 'req-test-001', 
      ticketNumber: 'F137-2024-TEST001',
      status: 'pending',
      message: 'Request submitted successfully'
    }
  }).as('createRequest')
})


// Enhanced custom assertions for better test readability
Cypress.Commands.add('shouldBeVisibleAndContain', { prevSubject: 'element' }, (subject, text: string) => {
  cy.wrap(subject).should('be.visible').and('contain.text', text)
})

Cypress.Commands.add('shouldBeOnPage', (path: string) => {
  cy.url().should('include', path)
  cy.get('[data-cy="page-content"], main, [role="main"]').should('be.visible')
})

Cypress.Commands.add('checkToast', (message: string, type: 'success' | 'error' = 'success') => {
  cy.get(`[data-cy="toast-${type}"], [data-sonner-toast][data-type="${type}"], .toast`)
    .should('be.visible')
    .and('contain.text', message)
})

// Performance monitoring
beforeEach(() => {
  // Mark test start time for performance monitoring
  cy.window().then((win) => {
    win.testStartTime = performance.now()
  })
})

afterEach(() => {
  // Log performance metrics for slower tests
  cy.window().then((win) => {
    const duration = performance.now() - win.testStartTime
    if (duration > 5000) { // Log if test takes longer than 5 seconds
      cy.log(`Test duration: ${Math.round(duration)}ms`)
    }
  })
})

// Custom chai assertions
const chai = (window as any).chai
if (chai) {
  chai.use((chai: any, utils: any) => {
    chai.Assertion.addMethod('beVisibleAndEnabled', function () {
      const obj = this._obj
      this.assert(
        obj.should('be.visible').and('not.be.disabled'),
        'expected #{this} to be visible and enabled',
        'expected #{this} not to be visible and enabled'
      )
    })
    
    chai.Assertion.addMethod('haveLoadedWithin', function (milliseconds: number) {
      const obj = this._obj
      const startTime = performance.now()
      this.assert(
        obj.should('exist').then(() => {
          const loadTime = performance.now() - startTime
          expect(loadTime).to.be.lessThan(milliseconds)
        }),
        `expected element to load within ${milliseconds}ms`,
        `expected element not to load within ${milliseconds}ms`
      )
    })
  })
}