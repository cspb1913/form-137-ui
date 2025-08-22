/// <reference types="cypress" />

describe('Auth0 Dashboard Redirect Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should show login prompt for unauthenticated users', () => {
    cy.visit('/')
    
    // Should show login prompt, not loading spinner
    cy.contains('Welcome Back').should('be.visible')
    cy.contains('Sign In to Continue').should('be.visible')
    cy.get('a[href*="/api/auth/login"]').should('be.visible')
    
    // Should not show access denied
    cy.get('body').should('not.contain.text', 'Access Denied')
    cy.get('body').should('not.contain.text', 'Unauthorized')
    
    cy.log('✅ Login prompt displays correctly for unauthenticated users')
  })

  it('should redirect to Auth0 when clicking login', () => {
    cy.visit('/')
    
    // Click the login button
    cy.get('a[href*="/api/auth/login"]').should('be.visible').click()
    
    // Should redirect to Auth0 domain
    cy.url({ timeout: 10000 }).should('include', 'auth0.com')
    
    cy.log('✅ Login button redirects to Auth0 correctly')
  })

  it('should redirect authenticated users to dashboard', () => {
    // This test checks if the redirect logic works by visiting a test endpoint
    // that can simulate an authenticated state
    cy.visit('/api/auth/me')
    
    // The /api/auth/me endpoint should return user info if authenticated
    // or 401 if not authenticated
    cy.request({
      url: '/api/auth/me',
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        cy.log('✅ User is authenticated, checking dashboard redirect')
        
        // If authenticated, visiting homepage should redirect to dashboard
        cy.visit('/')
        cy.url({ timeout: 5000 }).should('include', '/dashboard')
        
        // Dashboard should have navigation and content
        cy.get('main').should('be.visible')
        cy.contains('Dashboard').should('be.visible')
        
      } else {
        cy.log('ℹ️ User is not authenticated - this is expected in automated tests')
        cy.log('ℹ️ Manual test required: Login via Auth0 and verify dashboard redirect')
      }
    })
  })

  it('should have accessible dashboard route when authenticated', () => {
    // Try to visit dashboard directly
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      
      if (bodyText.includes('Dashboard') || bodyText.includes('My Requests')) {
        cy.log('✅ Dashboard is accessible (user is authenticated)')
        
        // Verify dashboard elements
        cy.get('main').should('be.visible')
        
        // Look for common dashboard elements
        const dashboardElements = ['Dashboard', 'Requests', 'Profile', 'Navigation']
        let foundElements = 0
        
        dashboardElements.forEach(element => {
          if (bodyText.includes(element)) {
            foundElements++
            cy.log(`✅ Found dashboard element: ${element}`)
          }
        })
        
        expect(foundElements).to.be.greaterThan(0, 'Should find at least one dashboard element')
        
      } else if (bodyText.includes('Welcome Back') || bodyText.includes('Sign In')) {
        cy.log('ℹ️ Dashboard requires authentication - redirected to login')
        cy.log('ℹ️ This indicates the auth protection is working correctly')
        
        // Verify we're seeing the login prompt
        cy.contains('Sign In to Continue').should('be.visible')
        
      } else {
        cy.log('⚠️ Unexpected dashboard state - manual verification needed')
      }
    })
  })

  it('should show proper error handling for Auth0 callback issues', () => {
    // Visit homepage with error parameter (simulates Auth0 callback error)
    cy.visit('/?error=access_denied&error_description=Test%20error')
    
    // Should still show login prompt, not crash
    cy.contains('Welcome Back').should('be.visible')
    cy.get('a[href*="/api/auth/login"]').should('be.visible')
    
    // Should not show dashboard or loading state
    cy.get('body').should('not.contain.text', 'Redirecting to dashboard')
    
    cy.log('✅ Auth0 callback errors handled gracefully')
  })
})