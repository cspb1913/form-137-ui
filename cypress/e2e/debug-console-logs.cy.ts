/// <reference types="cypress" />

describe('Debug Console Logs', () => {
  it('should capture console logs from MongoDB API hook', () => {
    const logs: string[] = []
    
    // Capture console logs
    cy.window().then((win) => {
      const originalLog = win.console.log
      win.console.log = (...args: any[]) => {
        const message = args.join(' ')
        logs.push(message)
        originalLog.apply(win.console, args)
      }
    })

    // Skip if Auth0 credentials are not configured
    if (!Cypress.env('AUTH0_REQUESTER_USERNAME') || !Cypress.env('AUTH0_REQUESTER_PASSWORD')) {
      cy.log('Skipping console log test - credentials not configured')
      return
    }

    cy.log('Testing console logs from MongoDB API integration')

    // Step 1: Login
    cy.visit('/')
    cy.wait(2000)

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

        cy.get('input[name="username"], input[name="email"], input[type="email"]').first().clear().type(username)
        cy.get('input[type="password"]').first().clear().type(password)
        cy.get('button[type="submit"], input[type="submit"]').first().click()
      }
    )

    // Wait for redirect and visit debug page
    cy.wait(5000)
    cy.visit('/debug-auth', { timeout: 30000 })
    cy.wait(5000) // Give time for hooks to execute

    // Check captured logs
    cy.then(() => {
      cy.log(`Captured ${logs.length} console logs`)
      
      const relevantLogs = logs.filter(log => 
        log.includes('🔍') || 
        log.includes('🔄') || 
        log.includes('🎫') || 
        log.includes('📡') || 
        log.includes('✅') || 
        log.includes('❌')
      )
      
      cy.log(`Found ${relevantLogs.length} MongoDB API logs:`)
      relevantLogs.forEach((log, index) => {
        cy.log(`${index + 1}: ${log}`)
      })

      if (relevantLogs.length === 0) {
        cy.log('❌ No MongoDB API hook logs found - hook not executing')
      } else {
        cy.log('✅ MongoDB API hook logs found')
      }
    })

    // Take screenshot
    cy.screenshot('console-logs-debug')
  })
})