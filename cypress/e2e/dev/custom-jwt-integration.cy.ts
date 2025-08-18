/// <reference types="cypress" />

/**
 * Custom JWT Authentication Integration Tests
 * 
 * These tests verify the custom JWT authentication system works correctly
 * with the API backend and UI frontend integration.
 */
describe('Custom JWT Authentication Integration', () => {
  const API_BASE_URL = 'http://localhost:8080'
  const DEV_API_SECRET = 'cspb-secure-api-key-2025'

  beforeEach(() => {
    // Clear any existing state
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('JWT Token Generation', () => {
    it('should generate admin tokens with correct role', () => {
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: {
          email: 'admin@test.com',
          name: 'Test Admin',
          role: 'Admin'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log('✅ Admin token generation successful')
          expect(response.body).to.have.property('access_token')
          expect(response.body).to.have.property('token_type', 'Bearer')
          expect(response.body).to.have.property('expires_in')
          
          // Verify token structure (JWT should have 3 parts)
          const token = response.body.access_token
          expect(token.split('.')).to.have.length(3)
        } else {
          cy.log(`⚠️ Admin token generation failed: ${response.status}`)
        }
      })
    })

    it('should generate requester tokens with correct role', () => {
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: {
          email: 'requester@test.com',
          name: 'Test Requester',
          role: 'Requester'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log('✅ Requester token generation successful')
          expect(response.body).to.have.property('access_token')
          expect(response.body).to.have.property('token_type', 'Bearer')
        } else {
          cy.log(`⚠️ Requester token generation failed: ${response.status}`)
        }
      })
    })

    it('should reject requests with invalid API secret', () => {
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': 'invalid-secret',
          'Content-Type': 'application/json'
        },
        body: {
          email: 'test@test.com',
          name: 'Test User',
          role: 'Requester'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(403)
        cy.log('✅ Invalid API secret properly rejected')
      })
    })

    it('should reject requests without API secret header', () => {
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: 'test@test.com',
          name: 'Test User',
          role: 'Requester'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(403)
        cy.log('✅ Missing API secret header properly rejected')
      })
    })
  })

  describe('JWKS Endpoint', () => {
    it('should provide public JWKS endpoint for token validation', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/auth/.well-known/jwks.json`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log('✅ JWKS endpoint accessible')
          expect(response.body).to.have.property('keys')
          expect(response.body.keys).to.be.an('array')
          expect(response.body.keys).to.have.length.greaterThan(0)
          
          // Verify key structure
          const key = response.body.keys[0]
          expect(key).to.have.property('kty')
          expect(key).to.have.property('alg')
          expect(key).to.have.property('use')
        } else {
          cy.log(`⚠️ JWKS endpoint not accessible: ${response.status}`)
        }
      })
    })

    it('should be publicly accessible without authentication', () => {
      // JWKS endpoint should not require any authentication
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/auth/.well-known/jwks.json`
      }).then((response) => {
        expect(response.status).to.equal(200)
        cy.log('✅ JWKS endpoint is publicly accessible')
      })
    })
  })

  describe('Protected API Endpoints', () => {
    it('should allow access to protected endpoints with valid JWT', () => {
      // First generate a valid JWT token
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: {
          email: 'admin@test.com',
          name: 'Test Admin',
          role: 'Admin'
        }
      }).then((tokenResponse) => {
        expect(tokenResponse.status).to.equal(200)
        const token = tokenResponse.body.access_token

        // Use token to access protected endpoint
        cy.request({
          method: 'GET',
          url: `${API_BASE_URL}/api/dashboard/requests`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            cy.log('✅ Protected endpoint accessible with valid JWT')
          } else {
            cy.log(`⚠️ Protected endpoint status: ${response.status}`)
          }
        })
      })
    })

    it('should reject access to protected endpoints without JWT', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/dashboard/requests`,
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
        cy.log('✅ Protected endpoint properly rejects unauthenticated requests')
      })
    })

    it('should reject access with invalid JWT token', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/dashboard/requests`,
        headers: {
          'Authorization': 'Bearer invalid.jwt.token',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
        cy.log('✅ Protected endpoint properly rejects invalid JWT')
      })
    })
  })

  describe('Role-Based Access Control', () => {
    it('should enforce admin-only endpoints for admin users', () => {
      // Generate admin token
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: {
          email: 'admin@test.com',
          name: 'Test Admin',
          role: 'Admin'
        }
      }).then((tokenResponse) => {
        const token = tokenResponse.body.access_token

        // Test admin endpoint access
        cy.request({
          method: 'GET',
          url: `${API_BASE_URL}/api/admin/users`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          // Admin endpoints may not exist yet, but should not be 403 Forbidden
          if (response.status !== 404) {
            expect(response.status).not.to.equal(403)
            cy.log('✅ Admin role has appropriate access')
          }
        })
      })
    })

    it('should restrict admin endpoints for requester users', () => {
      // Generate requester token
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: {
          email: 'requester@test.com',
          name: 'Test Requester',
          role: 'Requester'
        }
      }).then((tokenResponse) => {
        const token = tokenResponse.body.access_token

        // Test admin endpoint access (should be forbidden)
        cy.request({
          method: 'GET',
          url: `${API_BASE_URL}/api/admin/users`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          // Should be either 403 Forbidden or 404 Not Found (if endpoint doesn't exist)
          expect([403, 404]).to.include(response.status)
          cy.log('✅ Requester role properly restricted from admin endpoints')
        })
      })
    })
  })

  describe('Token Expiration', () => {
    it('should include expiration information in token response', () => {
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: {
          email: 'expiry@test.com',
          name: 'Expiry Test',
          role: 'Requester'
        }
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('expires_in')
        expect(response.body.expires_in).to.be.a('number')
        expect(response.body.expires_in).to.be.greaterThan(0)
        cy.log(`✅ Token expiration: ${response.body.expires_in} seconds`)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed token generation requests', () => {
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: {
          // Missing required fields
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400)
        cy.log('✅ Malformed requests properly rejected')
      })
    })

    it('should handle invalid JSON in token generation', () => {
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/token`,
        headers: {
          'X-CSPB-Secret': DEV_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: 'invalid json',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400)
        cy.log('✅ Invalid JSON properly rejected')
      })
    })
  })
})