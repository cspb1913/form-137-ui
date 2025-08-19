describe('Debug Fetch Error', () => {
  it('should test fetch to backend API from browser', () => {
    cy.visit('http://localhost:3000/debug')
    
    // Capture browser console logs
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog')
      cy.stub(win.console, 'error').as('consoleError')
    })
    
    // Test direct fetch to backend
    cy.window().then((win) => {
      // Test basic connectivity
      fetch('http://localhost:8080/api/health/liveness')
        .then(response => {
          console.log('✅ Health check:', response.status)
          return response.json()
        })
        .then(data => console.log('Health data:', data))
        .catch(error => console.error('❌ Health check failed:', error))
      
      // Test the failing endpoint
      fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log('✅ API response:', response.status)
          return response.text()
        })
        .then(data => console.log('API data:', data))
        .catch(error => {
          console.error('❌ API call failed:', error)
          console.error('Error type:', error.constructor.name)
          console.error('Error message:', error.message)
        })
    })
    
    // Wait and check console logs
    cy.wait(3000)
    cy.get('@consoleLog').should('have.been.called')
    cy.get('@consoleError').then((consoleError) => {
      if (consoleError.callCount > 0) {
        console.log('Console errors found:', consoleError.getCalls())
      }
    })
  })
})