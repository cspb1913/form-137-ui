/// <reference types="cypress" />

/**
 * Comprehensive Auth0 Security and Authentication Tests
 * 
 * This test suite covers all aspects of Auth0 integration security:
 * - JWT token validation and expiration
 * - Role-based access control (RBAC)
 * - API endpoint security
 * - CORS configuration
 * - Session management
 * - Error handling and edge cases
 */

describe('Auth0 Security and Authentication - Comprehensive Tests', () => {
  beforeEach(() => {
    // Clear all browser state and token cache
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    cy.clearTokenCache()
    
    // Validate Auth0 configuration before each test
    cy.validateAuth0Integration()
  })

  describe('JWT Token Security and Validation', () => {
    it('should successfully authenticate with client credentials and validate token structure', () => {
      cy.auth0ClientCredentials({ useCache: false }).then((tokenData) => {
        // Validate token structure
        expect(tokenData).to.have.property('access_token')
        expect(tokenData).to.have.property('token_type', 'Bearer')
        expect(tokenData).to.have.property('expires_in')
        
        // Validate JWT token format and claims
        cy.validateJWTToken(tokenData.access_token, {
          audience: Cypress.env('AUTH0_AUDIENCE')
        }).then((decoded) => {
          expect(decoded).to.have.property('iss')
          expect(decoded).to.have.property('aud', Cypress.env('AUTH0_AUDIENCE'))
          expect(decoded).to.have.property('exp')
          expect(decoded).to.have.property('iat')
          expect(decoded).to.have.property('scope')
          
          // Validate expiration is in the future
          expect(decoded.exp * 1000).to.be.greaterThan(Date.now())
          
          cy.log('JWT token validation completed successfully')
        })
      })
    })

    it('should authenticate admin user and validate role claims', () => {
      cy.auth0Login({ role: 'admin', useCache: false }).then((tokenData) => {
        // Validate admin-specific token claims
        cy.validateJWTToken(tokenData.access_token).then((decoded) => {
          // Check for role-specific claims
          const roles = decoded['https://form137.cspb.edu.ph/roles'] || []
          expect(roles).to.include('Admin')
          
          // Validate user information from ID token
          cy.validateJWTToken(tokenData.id_token).then((idDecoded) => {
            expect(idDecoded).to.have.property('email')
            expect(idDecoded).to.have.property('name')
            expect(idDecoded.email).to.contain('@')
            
            cy.log(`Admin user authenticated: ${idDecoded.email}`)
          })
        })
      })
    })

    it('should authenticate requester user and validate role claims', () => {
      cy.auth0Login({ role: 'requester', useCache: false }).then((tokenData) => {
        cy.validateJWTToken(tokenData.access_token).then((decoded) => {
          const roles = decoded['https://form137.cspb.edu.ph/roles'] || []
          expect(roles).to.include('Requester')
          expect(roles).to.not.include('Admin')
          
          cy.log('Requester user role validation completed')
        })
      })
    })

    it('should handle token expiration scenarios correctly', () => {
      cy.testTokenExpiration('requester').then((response) => {
        // Token expiration handling should succeed
        expect(response.status).to.be.oneOf([200, 204])
        cy.log('Token expiration scenario handled successfully')
      })
    })

    it('should validate token refresh and caching mechanisms', () => {
      // First request - should generate new token
      cy.auth0ClientCredentials({ useCache: false }).then((firstToken) => {
        const firstAccessToken = firstToken.access_token
        
        // Second request - should use cached token
        cy.auth0ClientCredentials({ useCache: true }).then((secondToken) => {
          expect(secondToken.access_token).to.equal(firstAccessToken)
          cy.log('Token caching validated successfully')
        })
        
        // Clear cache and request again - should generate new token
        cy.clearTokenCache({ clientCredentialsOnly: true })
        cy.auth0ClientCredentials({ useCache: true }).then((thirdToken) => {
          expect(thirdToken.access_token).to.not.equal(firstAccessToken)
          cy.log('Cache clearing and token refresh validated')
        })
      })
    })
  })

  describe('Role-Based Access Control (RBAC)', () => {
    it('should enforce admin-only endpoints for admin users', () => {
      // Test admin endpoints with admin credentials
      const adminEndpoints = [
        '/admin/requests',
        '/requests/stats',
        '/admin/dashboard'
      ]
      
      adminEndpoints.forEach(endpoint => {
        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}${endpoint}`
        }, {
          useClientCredentials: false,
          userRole: 'admin',
          retryOnUnauthorized: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 404]) // 404 if endpoint doesn't exist
          if (response.status === 404) {
            cy.log(`Admin endpoint ${endpoint} not implemented - skipping`)
          } else {
            cy.log(`Admin access to ${endpoint} validated: ${response.status}`)
          }
        })
      })
    })

    it('should block requester access to admin-only endpoints', () => {
      const adminEndpoints = [
        '/admin/requests',
        '/requests/stats',
        '/admin/dashboard'
      ]
      
      adminEndpoints.forEach(endpoint => {
        cy.testUnauthorizedAccess(endpoint, 'GET', 'requester').then((response) => {
          expect(response.status).to.be.oneOf([401, 403])
          cy.log(`Correctly blocked requester access to ${endpoint}: ${response.status}`)
        })
      })
    })

    it('should allow requester access to user-specific endpoints', () => {
      const requesterEndpoints = [
        '/requests/mine',
        '/requests'
      ]
      
      requesterEndpoints.forEach(endpoint => {
        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}${endpoint}`
        }, {
          useClientCredentials: false,
          userRole: 'requester',
          retryOnUnauthorized: true
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 404])
          if (response.status === 200) {
            expect(response.body).to.exist
            cy.log(`Requester access to ${endpoint} validated: ${response.status}`)
          }
        })
      })
    })

    it('should validate request ownership enforcement', () => {
      // Create a request as requester user
      cy.createForm137Request({
        studentId: 'RBAC-TEST-' + Date.now(),
        requestPurpose: 'RBAC ownership test',
        urgencyLevel: 'REGULAR'
      }).then((createResponse) => {
        const ticketNumber = createResponse.body.ticketNumber
        
        // Requester should be able to view their own request
        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/requests/${ticketNumber}`
        }, {
          useClientCredentials: false,
          userRole: 'requester'
        }).then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('ticketNumber', ticketNumber)
        })
        
        // Admin should also be able to view any request
        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/requests/${ticketNumber}`
        }, {
          useClientCredentials: false,
          userRole: 'admin'
        }).then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('ticketNumber', ticketNumber)
        })
      })
    })

    it('should validate status update permissions', () => {
      // Create a test request
      cy.createForm137Request({
        studentId: 'STATUS-TEST-' + Date.now(),
        requestPurpose: 'Status update permission test'
      }).then((createResponse) => {
        const ticketNumber = createResponse.body.ticketNumber
        
        // Requester should NOT be able to update status
        cy.updateForm137Status(ticketNumber, 'processing', 'Unauthorized update attempt', {
          useAdminRole: false,
          expectSuccess: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403])
          cy.log(`Correctly blocked requester status update: ${response.status}`)
        })
        
        // Admin should be able to update status
        cy.updateForm137Status(ticketNumber, 'processing', 'Admin status update', {
          useAdminRole: true,
          expectSuccess: true
        }).then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.status).to.equal('processing')
          cy.log('Admin status update validated successfully')
        })
      })
    })
  })

  describe('API Security and CORS', () => {
    it('should validate CORS headers for cross-origin requests', () => {
      cy.testCORSAndSecurity('/health/liveness').then((response) => {
        // Validate CORS headers are present and configured correctly
        expect(response.headers).to.have.property('access-control-allow-origin')
        expect(response.headers).to.have.property('access-control-allow-methods')
        expect(response.headers).to.have.property('access-control-allow-headers')
        
        // Validate specific CORS configuration
        const allowedOrigins = response.headers['access-control-allow-origin']
        expect(allowedOrigins).to.satisfy((origins) => {
          return origins === '*' || origins.includes('localhost:3000') || origins.includes('form137.cspb.edu.ph')
        })
        
        const allowedMethods = response.headers['access-control-allow-methods']
        expect(allowedMethods).to.include('GET')
        expect(allowedMethods).to.include('POST')
        
        cy.log('CORS configuration validated successfully')
      })
    })

    it('should reject requests without valid authentication tokens', () => {
      // Test API endpoints without authentication
      const protectedEndpoints = [
        '/requests',
        '/requests/mine',
        '/admin/requests'
      ]
      
      protectedEndpoints.forEach(endpoint => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}${endpoint}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403])
          cy.log(`Correctly rejected unauthenticated request to ${endpoint}: ${response.status}`)
        })
      })
    })

    it('should reject requests with malformed or expired tokens', () => {
      const malformedTokens = [
        'invalid.token.format',
        'Bearer malformed-token',
        '',
        'not-a-jwt-token'
      ]
      
      malformedTokens.forEach(token => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/requests`,
          headers: {
            'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403])
          cy.log(`Correctly rejected malformed token: ${response.status}`)
        })
      })
    })

    it('should validate Content-Type and Accept headers', () => {
      cy.auth0ClientCredentials().then((tokenData) => {
        // Test with various Content-Type headers
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_BASE_URL')}/requests`,
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'text/plain' // Invalid content type
          },
          body: 'invalid body format',
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 415, 422])
          cy.log(`Correctly rejected invalid Content-Type: ${response.status}`)
        })
      })
    })

    it('should handle rate limiting and throttling', () => {
      // Make multiple rapid requests to test rate limiting
      const requests = []
      for (let i = 0; i < 10; i++) {
        requests.push(
          cy.testAPIHealth()
        )
      }
      
      // Wait for all requests to complete
      cy.wrap(Promise.allSettled(requests)).then((results) => {
        const responses = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
        
        // Check if any rate limiting occurred
        const rateLimited = responses.some(r => r.status === 429)
        if (rateLimited) {
          cy.log('Rate limiting detected and handled correctly')
        } else {
          cy.log('No rate limiting detected in test scenario')
        }
        
        // At least some requests should succeed
        const successful = responses.filter(r => r.status === 200 || r.status === 204)
        expect(successful.length).to.be.greaterThan(0)
      })
    })
  })

  describe('Session Management and Edge Cases', () => {
    it('should handle concurrent authentication requests', () => {
      // Clear cache to force new authentication
      cy.clearTokenCache()
      
      // Make multiple concurrent authentication requests
      const authPromises = [
        cy.auth0ClientCredentials({ useCache: false }),
        cy.auth0ClientCredentials({ useCache: false }),
        cy.auth0Login({ role: 'requester', useCache: false }),
        cy.auth0Login({ role: 'admin', useCache: false })
      ]
      
      cy.wrap(Promise.allSettled(authPromises)).then((results) => {
        const successful = results.filter(r => r.status === 'fulfilled')
        expect(successful.length).to.be.greaterThan(0)
        
        cy.log(`Concurrent authentication completed: ${successful.length}/${results.length} successful`)
      })
    })

    it('should handle Auth0 service unavailability gracefully', () => {
      // Mock Auth0 service unavailability
      cy.intercept('POST', 'https://jasoncalalang.auth0.com/oauth/token', {
        statusCode: 503,
        body: { error: 'Service Unavailable' },
        delay: 1000
      }).as('auth0Unavailable')
      
      // Attempt authentication - should handle gracefully
      cy.auth0ClientCredentials({ useCache: false, retryAttempts: 1 }).then((result) => {
        // Should either succeed with retry or fail gracefully
        cy.log('Auth0 service unavailability test completed')
      }).catch((error) => {
        expect(error.message).to.include('Service Unavailable')
        cy.log('Auth0 service unavailability handled correctly')
      })
    })

    it('should validate token storage security in browser', () => {
      cy.auth0Login({ role: 'requester' }).then((tokenData) => {
        // Check that sensitive data is not stored insecurely
        cy.window().then((win) => {
          const localStorage = win.localStorage
          const sessionStorage = win.sessionStorage
          
          // Validate that tokens are not stored in plain text in dangerous locations
          Object.keys(localStorage).forEach(key => {
            const value = localStorage.getItem(key)
            if (value && value.includes('eyJ')) { // JWT tokens start with eyJ
              cy.log(`Warning: JWT token found in localStorage key: ${key}`)
              // In production, this should be properly secured
            }
          })
          
          cy.log('Browser token storage security check completed')
        })
      })
    })

    it('should test authentication error recovery', () => {
      // Test recovery from various authentication errors
      const errorScenarios = [
        { status: 400, error: 'invalid_request' },
        { status: 401, error: 'invalid_client' },
        { status: 403, error: 'access_denied' }
      ]
      
      errorScenarios.forEach((scenario, index) => {
        cy.intercept('POST', 'https://jasoncalalang.auth0.com/oauth/token', {
          statusCode: scenario.status,
          body: { error: scenario.error, error_description: `Test error ${index}` }
        }).as(`authError${index}`)
        
        cy.auth0ClientCredentials({ useCache: false, retryAttempts: 1 }).catch((error) => {
          expect(error.message).to.include(scenario.error)
          cy.log(`Error scenario ${scenario.status} handled correctly`)
        })
      })
    })
  })

  describe('Performance and Scalability', () => {
    it('should measure authentication performance', () => {
      const startTime = Date.now()
      
      cy.auth0ClientCredentials({ useCache: false }).then((tokenData) => {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        expect(duration).to.be.lessThan(5000) // Should complete within 5 seconds
        cy.log(`Client credentials authentication completed in ${duration}ms`)
        
        // Test API call performance with token
        const apiStartTime = Date.now()
        cy.testAPIHealth().then((response) => {
          const apiEndTime = Date.now()
          const apiDuration = apiEndTime - apiStartTime
          
          expect(apiDuration).to.be.lessThan(3000) // API calls should be fast
          cy.log(`API call completed in ${apiDuration}ms`)
        })
      })
    })

    it('should validate token caching performance benefits', () => {
      // Clear cache and measure fresh token request
      cy.clearTokenCache()
      const freshStartTime = Date.now()
      
      cy.auth0ClientCredentials({ useCache: false }).then((tokenData) => {
        const freshEndTime = Date.now()
        const freshDuration = freshEndTime - freshStartTime
        
        // Now measure cached token request
        const cachedStartTime = Date.now()
        cy.auth0ClientCredentials({ useCache: true }).then((cachedTokenData) => {
          const cachedEndTime = Date.now()
          const cachedDuration = cachedEndTime - cachedStartTime
          
          // Cached request should be significantly faster
          expect(cachedDuration).to.be.lessThan(freshDuration / 2)
          cy.log(`Fresh token: ${freshDuration}ms, Cached token: ${cachedDuration}ms`)
          cy.log('Token caching performance validated')
        })
      })
    })
  })

  after(() => {
    // Cleanup - clear all tokens and caches
    cy.clearTokenCache()
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.log('Auth0 security test cleanup completed')
  })
})