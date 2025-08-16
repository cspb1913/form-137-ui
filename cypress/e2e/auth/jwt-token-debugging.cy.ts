/// <reference types="cypress" />

/**
 * Comprehensive JWT Token Debugging Test
 * 
 * This test captures the actual JWT token from Auth0 authentication
 * and analyzes it to identify the root cause of 401 errors.
 */

describe('JWT Token Debugging', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should capture and analyze Auth0 JWT token structure', () => {
    cy.log('🔍 Starting JWT Token Analysis')

    // Visit the debug auth page
    cy.visit('/debug-auth')
    
    // Check if user is already logged in
    cy.get('body').then($body => {
      if ($body.text().includes('Please log in')) {
        cy.log('👤 User not logged in - starting login flow')
        
        // Click login link
        cy.contains('Login').click()
        
        // Auth0 login process
        cy.origin('https://jasoncalalang.auth0.com', () => {
          // Fill in login credentials
          cy.get('input[name="email"]', { timeout: 10000 }).type(Cypress.env('AUTH0_REQUESTER_USERNAME'))
          cy.get('input[name="password"]').type(Cypress.env('AUTH0_REQUESTER_PASSWORD'))
          cy.get('button[type="submit"]').click()
        })
        
        // Wait to return to app
        cy.url({ timeout: 15000 }).should('include', 'localhost:3000')
        cy.visit('/debug-auth') // Ensure we're on the debug page
      }
    })

    // User should now be logged in
    cy.contains('Auth0 Debug Information', { timeout: 10000 }).should('be.visible')
    
    // Click the button to get access token and test API
    cy.contains('Get Access Token & Test API').click()
    
    // Wait for the operation to complete
    cy.wait(3000)
    
    // Capture the token information from the page
    cy.get('pre').contains('token').should('be.visible').then($pre => {
      const tokenInfoText = $pre.text()
      cy.log('📋 Token Information Captured')
      
      try {
        const tokenInfo = JSON.parse(tokenInfoText)
        
        // Log token structure analysis
        cy.log('🔍 Token Analysis:')
        cy.log(`   Token Length: ${tokenInfo.token?.length || 'N/A'}`)
        cy.log(`   Audience: ${tokenInfo.payload?.aud || 'N/A'}`)
        cy.log(`   Issuer: ${tokenInfo.payload?.iss || 'N/A'}`)
        cy.log(`   Client ID (azp): ${tokenInfo.payload?.azp || 'N/A'}`)
        cy.log(`   Scope: ${tokenInfo.payload?.scope || 'N/A'}`)
        cy.log(`   Expires: ${tokenInfo.expires || 'N/A'}`)
        
        // Check API test results
        if (tokenInfo.apiTest) {
          cy.log(`🌐 API Test Result: ${tokenInfo.apiTest.status}`)
          
          if (tokenInfo.apiTest.status === 401) {
            cy.log('❌ API returned 401 - Authentication failed')
            cy.log('🔍 Analyzing token for potential issues...')
            
            // Check common issues
            const expectedAudience = Cypress.env('AUTH0_AUDIENCE')
            const expectedIssuer = `https://${Cypress.env('AUTH0_DOMAIN')}/`
            
            if (tokenInfo.payload?.aud !== expectedAudience) {
              cy.log(`❌ AUDIENCE MISMATCH:`)
              cy.log(`   Expected: ${expectedAudience}`)
              cy.log(`   Actual: ${tokenInfo.payload?.aud}`)
            }
            
            if (tokenInfo.payload?.iss !== expectedIssuer) {
              cy.log(`❌ ISSUER MISMATCH:`)
              cy.log(`   Expected: ${expectedIssuer}`)
              cy.log(`   Actual: ${tokenInfo.payload?.iss}`)
            }
            
            // Check token type (should be access token, not ID token)
            if (tokenInfo.payload?.nonce) {
              cy.log(`❌ TOKEN TYPE ISSUE: This appears to be an ID token (has nonce)`)
              cy.log(`   Access tokens should not have 'nonce' field`)
            }
            
          } else if (tokenInfo.apiTest.status === 200) {
            cy.log('✅ API call successful - No authentication issue')
          } else {
            cy.log(`⚠️  API returned unexpected status: ${tokenInfo.apiTest.status}`)
          }
        }
        
        // Store token for further analysis
        cy.wrap(tokenInfo).as('tokenInfo')
        
      } catch (error) {
        cy.log('❌ Failed to parse token information')
        cy.log(`Error: ${error.message}`)
      }
    })
  })

  it('should test token manually against backend API', () => {
    cy.log('🧪 Manual Token Testing Against Backend')
    
    // Get the token info from previous test or generate new one
    cy.visit('/debug-auth')
    
    // Ensure user is logged in
    cy.get('body').then($body => {
      if ($body.text().includes('Please log in')) {
        cy.log('User needs to login first - run previous test')
        return
      }
      
      // Get fresh token
      cy.contains('Get Access Token & Test API').click()
      cy.wait(3000)
      
      // Extract just the token string for manual testing
      cy.get('pre').contains('token').then($pre => {
        const tokenInfoText = $pre.text()
        
        try {
          const tokenInfo = JSON.parse(tokenInfoText)
          const token = tokenInfo.token
          
          if (!token) {
            cy.log('❌ No token found')
            return
          }
          
          cy.log('🔑 Testing token against various endpoints')
          
          // Test 1: Health endpoint (should work without auth)
          cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
            failOnStatusCode: false
          }).then(response => {
            cy.log(`✅ Health endpoint: ${response.status}`)
          })
          
          // Test 2: Protected endpoint without token (should be 401)
          cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/dashboard/requests`,
            failOnStatusCode: false
          }).then(response => {
            cy.log(`🔒 Dashboard without token: ${response.status}`)
            expect(response.status).to.eq(401)
          })
          
          // Test 3: Protected endpoint with token
          cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/dashboard/requests`,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            failOnStatusCode: false
          }).then(response => {
            cy.log(`🎯 Dashboard with token: ${response.status}`)
            
            if (response.status === 401) {
              cy.log('❌ Token validation failed')
              
              // Additional debugging info
              cy.log('🔍 Debugging Information:')
              cy.log(`   Token starts with: ${token.substring(0, 50)}...`)
              cy.log(`   Token length: ${token.length}`)
              cy.log(`   Expected audience: ${Cypress.env('AUTH0_AUDIENCE')}`)
              cy.log(`   Expected issuer: https://${Cypress.env('AUTH0_DOMAIN')}/`)
              
              // Try to decode the token payload
              try {
                const parts = token.split('.')
                if (parts.length === 3) {
                  const payload = JSON.parse(atob(parts[1]))
                  cy.log(`   Actual audience: ${payload.aud}`)
                  cy.log(`   Actual issuer: ${payload.iss}`)
                  cy.log(`   Subject: ${payload.sub}`)
                  cy.log(`   Authorized party: ${payload.azp}`)
                  cy.log(`   Scope: ${payload.scope}`)
                  
                  // Check expiration
                  const now = Math.floor(Date.now() / 1000)
                  if (payload.exp && payload.exp < now) {
                    cy.log(`❌ Token is expired! Expires: ${new Date(payload.exp * 1000)}`)
                  } else {
                    cy.log(`✅ Token is not expired. Expires: ${new Date(payload.exp * 1000)}`)
                  }
                }
              } catch (decodeError) {
                cy.log(`❌ Failed to decode token: ${decodeError.message}`)
              }
              
            } else if (response.status === 200) {
              cy.log('✅ Token validation successful!')
              cy.log(`Response: ${JSON.stringify(response.body, null, 2)}`)
            } else {
              cy.log(`⚠️  Unexpected response: ${response.status}`)
              cy.log(`Response body: ${JSON.stringify(response.body, null, 2)}`)
            }
          })
          
        } catch (error) {
          cy.log(`❌ Error processing token: ${error.message}`)
        }
      })
    })
  })

  it('should provide comprehensive debugging report', () => {
    cy.log('📊 Generating Comprehensive Debugging Report')
    
    const frontendConfig = {
      domain: Cypress.env('AUTH0_DOMAIN'),
      clientId: Cypress.env('AUTH0_CLIENT_ID'),
      audience: Cypress.env('AUTH0_AUDIENCE'),
      scope: Cypress.env('AUTH0_SCOPE'),
      apiBaseUrl: Cypress.env('API_BASE_URL')
    }
    
    cy.log('📋 FRONTEND CONFIGURATION:')
    cy.log(`   Domain: ${frontendConfig.domain}`)
    cy.log(`   Client ID: ${frontendConfig.clientId}`)
    cy.log(`   Audience: ${frontendConfig.audience}`)
    cy.log(`   Scope: ${frontendConfig.scope}`)
    cy.log(`   API Base URL: ${frontendConfig.apiBaseUrl}`)
    
    cy.log('📋 EXPECTED BACKEND CONFIGURATION:')
    cy.log(`   Issuer URI: https://${frontendConfig.domain}/`)
    cy.log(`   Expected Audience: ${frontendConfig.audience}`)
    cy.log(`   Algorithm: RS256`)
    cy.log(`   JWKS URL: https://${frontendConfig.domain}/.well-known/jwks.json`)
    
    cy.log('🔍 COMMON ISSUES TO CHECK:')
    cy.log('   1. Audience mismatch between frontend request and backend expectation')
    cy.log('   2. Issuer URI trailing slash difference')
    cy.log('   3. Getting ID token instead of access token')
    cy.log('   4. JWKS endpoint accessibility from backend')
    cy.log('   5. Token expiration timing')
    cy.log('   6. CORS configuration preventing proper token flow')
    
    cy.log('🛠️  NEXT STEPS:')
    cy.log('   1. Run backend tests: ./gradlew test --tests="JwtTokenValidationTest"')
    cy.log('   2. Check backend logs for JWT validation errors')
    cy.log('   3. Verify Auth0 application configuration')
    cy.log('   4. Test JWKS endpoint accessibility')
    cy.log('   5. Compare actual vs expected token claims')
    
    // Test Auth0 endpoints accessibility
    cy.request({
      method: 'GET',
      url: `https://${frontendConfig.domain}/.well-known/jwks.json`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status === 200) {
        cy.log('✅ JWKS endpoint accessible')
      } else {
        cy.log(`❌ JWKS endpoint error: ${response.status}`)
      }
    })
    
    cy.request({
      method: 'GET',
      url: `https://${frontendConfig.domain}/.well-known/openid_configuration`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status === 200) {
        cy.log('✅ OpenID configuration accessible')
        if (response.body.issuer) {
          cy.log(`   Issuer from discovery: ${response.body.issuer}`)
        }
      } else {
        cy.log(`❌ OpenID configuration error: ${response.status}`)
      }
    })
  })
})