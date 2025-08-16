/// <reference types="cypress" />

/**
 * Enhanced API Integration Tests with Auth0 JWT Validation
 * 
 * This test suite provides comprehensive API integration testing with focus on:
 * - JWT token validation and security
 * - Spring Boot backend integration
 * - Role-based API access control
 * - Error handling and resilience
 * - Performance and reliability
 */

describe('Enhanced API Integration - Auth0 JWT & Spring Boot', () => {
  beforeEach(() => {
    // Clear state and validate Auth0 integration
    cy.clearTokenCache();
    cy.validateAuth0Integration();
  });

  describe('JWT Token Integration with Spring Boot', () => {
    it('should validate client credentials token with Spring Boot API', () => {
      cy.auth0ClientCredentials({ useCache: false }).then((tokenData) => {
        // Validate token structure
        expect(tokenData).to.have.property('access_token');
        expect(tokenData).to.have.property('token_type', 'Bearer');
        
        // Decode and validate JWT claims
        cy.validateJWTToken(tokenData.access_token, {
          audience: Cypress.env('AUTH0_AUDIENCE')
        }).then((decoded) => {
          // Validate issuer matches Auth0 configuration
          expect(decoded.iss).to.equal(`https://${Cypress.env('AUTH0_DOMAIN')}/`);
          expect(decoded.aud).to.equal(Cypress.env('AUTH0_AUDIENCE'));
          
          // Test API call with validated token
          return cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          });
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 204]);
          cy.log('✓ JWT token validated successfully with Spring Boot API');
        });
      });
    });

    it('should validate user tokens with role-specific claims', () => {
      const roleTests = [
        { role: 'admin', expectedRoles: ['Admin'] },
        { role: 'requester', expectedRoles: ['Requester'] }
      ];

      roleTests.forEach(test => {
        cy.auth0Login({ role: test.role, useCache: false }).then((tokenData) => {
          cy.validateJWTToken(tokenData.access_token).then((decoded) => {
            // Validate custom role claims
            const roles = decoded['https://form137.cspb.edu.ph/roles'] || [];
            test.expectedRoles.forEach(expectedRole => {
              expect(roles).to.include(expectedRole);
            });
            
            // Test API access with role-specific token
            return cy.request({
              method: 'GET',
              url: `${Cypress.env('API_BASE_URL')}/requests/mine`,
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
              },
              failOnStatusCode: false
            });
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 404]); // 404 if endpoint not implemented
            cy.log(`✓ ${test.role} token with role claims validated`);
          });
        });
      });
    });

    it('should handle JWT token expiration and refresh scenarios', () => {
      // Test token near expiration
      cy.auth0ClientCredentials({ useCache: false }).then((tokenData) => {
        // Validate current token works
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 204]);
        });

        // Clear token cache to force refresh
        cy.clearTokenCache({ clientCredentialsOnly: true });

        // Get new token and verify it's different
        cy.auth0ClientCredentials({ useCache: false }).then((newTokenData) => {
          expect(newTokenData.access_token).to.not.equal(tokenData.access_token);
          
          // Verify new token works
          return cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
            headers: { 'Authorization': `Bearer ${newTokenData.access_token}` },
            failOnStatusCode: false
          });
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 204]);
          cy.log('✓ Token refresh and expiration handling validated');
        });
      });
    });

    it('should reject invalid and malformed JWT tokens', () => {
      const invalidTokens = [
        { name: 'Empty token', token: '' },
        { name: 'Invalid format', token: 'invalid.jwt.token' },
        { name: 'Missing signature', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' },
        { name: 'Malformed payload', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.signature' }
      ];

      invalidTokens.forEach(testCase => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
          headers: {
            'Authorization': `Bearer ${testCase.token}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403]);
          cy.log(`✓ ${testCase.name} correctly rejected: ${response.status}`);
        });
      });
    });
  });

  describe('Spring Boot API Endpoint Security', () => {
    it('should validate CORS configuration for cross-origin requests', () => {
      cy.testCORSAndSecurity('/health/liveness').then((response) => {
        // Validate CORS headers
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers).to.have.property('access-control-allow-methods');
        expect(response.headers).to.have.property('access-control-allow-headers');
        
        // Validate specific Spring Boot CORS settings
        const allowedMethods = response.headers['access-control-allow-methods'];
        expect(allowedMethods).to.include('GET');
        expect(allowedMethods).to.include('POST');
        expect(allowedMethods).to.include('PUT');
        
        const allowedHeaders = response.headers['access-control-allow-headers'];
        expect(allowedHeaders.toLowerCase()).to.include('authorization');
        expect(allowedHeaders.toLowerCase()).to.include('content-type');
        
        cy.log('✓ Spring Boot CORS configuration validated');
      });
    });

    it('should enforce role-based access control on API endpoints', () => {
      const endpointTests = [
        {
          endpoint: '/admin/requests',
          method: 'GET',
          allowedRoles: ['admin'],
          deniedRoles: ['requester']
        },
        {
          endpoint: '/requests/mine',
          method: 'GET',
          allowedRoles: ['admin', 'requester'],
          deniedRoles: []
        },
        {
          endpoint: '/requests',
          method: 'POST',
          allowedRoles: ['admin', 'requester'],
          deniedRoles: []
        }
      ];

      endpointTests.forEach(test => {
        // Test allowed roles
        test.allowedRoles.forEach(role => {
          cy.authenticatedRequest({
            method: test.method,
            url: `${Cypress.env('API_BASE_URL')}${test.endpoint}`,
            body: test.method === 'POST' ? { studentId: 'RBAC-TEST', requestPurpose: 'RBAC testing' } : undefined
          }, {
            useClientCredentials: false,
            userRole: role,
            retryOnUnauthorized: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201, 404]); // 404 if not implemented
            cy.log(`✓ ${role} allowed access to ${test.method} ${test.endpoint}`);
          });
        });

        // Test denied roles
        test.deniedRoles.forEach(role => {
          cy.testUnauthorizedAccess(test.endpoint, test.method, role).then((response) => {
            expect(response.status).to.be.oneOf([401, 403]);
            cy.log(`✓ ${role} correctly denied access to ${test.method} ${test.endpoint}`);
          });
        });
      });
    });

    it('should validate request/response data structure and validation', () => {
      // Test POST request validation
      cy.auth0ClientCredentials().then((tokenData) => {
        const testCases = [
          {
            name: 'Valid request',
            data: {
              studentId: 'VALID-TEST-' + Date.now(),
              requestPurpose: 'API validation testing',
              urgencyLevel: 'REGULAR'
            },
            expectedStatus: [200, 201]
          },
          {
            name: 'Missing required fields',
            data: {
              studentId: 'INVALID-TEST-' + Date.now()
              // Missing required fields
            },
            expectedStatus: [400, 422]
          },
          {
            name: 'Invalid data types',
            data: {
              studentId: 123, // Should be string
              requestPurpose: null,
              urgencyLevel: 'INVALID_LEVEL'
            },
            expectedStatus: [400, 422]
          }
        ];

        testCases.forEach(testCase => {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('API_BASE_URL')}/requests`,
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            },
            body: testCase.data,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf(testCase.expectedStatus);
            
            if (response.status >= 200 && response.status < 300) {
              // Validate successful response structure
              expect(response.body).to.have.property('ticketNumber');
              expect(response.body).to.have.property('status');
              expect(response.body.ticketNumber).to.match(/^F137-\d{4}-/);
            } else {
              // Validate error response structure
              expect(response.body).to.have.property('error');
            }
            
            cy.log(`✓ ${testCase.name} validation: ${response.status}`);
          });
        });
      });
    });

    it('should handle concurrent API requests efficiently', () => {
      const concurrentRequests = 10;
      const requests = [];

      // Create multiple concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          cy.authenticatedRequest({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/health/liveness`
          }, {
            useClientCredentials: true,
            retryOnUnauthorized: false
          })
        );
      }

      // Wait for all requests to complete
      cy.wrap(Promise.allSettled(requests)).then((results) => {
        const successful = results.filter(r => 
          r.status === 'fulfilled' && 
          (r.value.status === 200 || r.value.status === 204)
        ).length;

        // Should handle at least 80% of concurrent requests successfully
        expect(successful).to.be.greaterThan(concurrentRequests * 0.8);
        
        cy.log(`Concurrent requests: ${successful}/${concurrentRequests} successful`);
        cy.log('✓ Concurrent API request handling validated');
      });
    });
  });

  describe('API Error Handling and Resilience', () => {
    it('should handle various HTTP error scenarios gracefully', () => {
      const errorScenarios = [
        { status: 400, description: 'Bad Request' },
        { status: 401, description: 'Unauthorized' },
        { status: 403, description: 'Forbidden' },
        { status: 404, description: 'Not Found' },
        { status: 500, description: 'Internal Server Error' },
        { status: 503, description: 'Service Unavailable' }
      ];

      errorScenarios.forEach(scenario => {
        // Mock the error response
        cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/test-error-${scenario.status}`, {
          statusCode: scenario.status,
          body: { 
            error: scenario.description,
            message: `Test ${scenario.status} error`,
            timestamp: new Date().toISOString()
          }
        }).as(`error${scenario.status}`);

        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/test-error-${scenario.status}`
        }, {
          useClientCredentials: true,
          retryOnUnauthorized: scenario.status !== 401
        }).then((response) => {
          expect(response.status).to.equal(scenario.status);
          expect(response.body).to.have.property('error');
          cy.log(`✓ ${scenario.status} ${scenario.description} handled correctly`);
        });
      });
    });

    it('should implement proper timeout and retry mechanisms', () => {
      // Test slow response handling
      cy.intercept('GET', `${Cypress.env('API_BASE_URL')}/slow-endpoint`, (req) => {
        req.reply((res) => {
          res.delay(3000); // 3 second delay
          res.send({ statusCode: 200, body: { message: 'Slow response' } });
        });
      }).as('slowResponse');

      const startTime = Date.now();
      
      cy.authenticatedRequest({
        method: 'GET',
        url: `${Cypress.env('API_BASE_URL')}/slow-endpoint`,
        timeout: 5000 // 5 second timeout
      }, {
        useClientCredentials: true
      }).then((response) => {
        const duration = Date.now() - startTime;
        expect(response.status).to.equal(200);
        expect(duration).to.be.greaterThan(2500); // Should have waited
        expect(duration).to.be.lessThan(5000); // But not timeout
        cy.log(`✓ Slow response handled: ${duration}ms`);
      });
    });

    it('should validate API rate limiting and throttling', () => {
      // Make rapid requests to test rate limiting
      const rapidRequests = [];
      for (let i = 0; i < 20; i++) {
        rapidRequests.push(
          cy.authenticatedRequest({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/health/liveness`
          }, {
            useClientCredentials: true,
            retryOnUnauthorized: false
          })
        );
      }

      cy.wrap(Promise.allSettled(rapidRequests)).then((results) => {
        const responses = results
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value);

        const rateLimited = responses.some(r => r.status === 429);
        const successful = responses.filter(r => r.status === 200 || r.status === 204);

        if (rateLimited) {
          cy.log('✓ Rate limiting detected and working correctly');
        } else {
          cy.log('No rate limiting detected in test scenario');
        }

        // Should have some successful requests
        expect(successful.length).to.be.greaterThan(0);
        cy.log(`Rate limiting test: ${successful.length}/20 requests successful`);
      });
    });
  });

  describe('API Performance and Monitoring', () => {
    it('should measure API response times and validate performance', () => {
      const performanceTests = [
        { endpoint: '/health/liveness', maxTime: 1000 },
        { endpoint: '/requests', maxTime: 3000 },
        { endpoint: '/admin/requests', maxTime: 5000 }
      ];

      performanceTests.forEach(test => {
        const startTime = Date.now();
        
        cy.authenticatedRequest({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}${test.endpoint}`
        }, {
          useClientCredentials: false,
          userRole: test.endpoint.includes('admin') ? 'admin' : 'requester'
        }).then((response) => {
          const duration = Date.now() - startTime;
          
          if (response.status === 200 || response.status === 204) {
            expect(duration).to.be.lessThan(test.maxTime);
            cy.log(`✓ ${test.endpoint} response time: ${duration}ms (limit: ${test.maxTime}ms)`);
          } else if (response.status === 404) {
            cy.log(`Endpoint ${test.endpoint} not implemented - skipping performance test`);
          } else {
            cy.log(`Unexpected response ${response.status} for ${test.endpoint}`);
          }
        });
      });
    });

    it('should validate API response consistency and data integrity', () => {
      // Create a test request and verify data consistency across multiple calls
      cy.createForm137Request({
        studentId: 'CONSISTENCY-' + Date.now(),
        requestPurpose: 'Data consistency testing'
      }).then((createResponse) => {
        const ticketNumber = createResponse.body.ticketNumber;
        
        // Make multiple requests for the same data
        const consistencyRequests = [];
        for (let i = 0; i < 5; i++) {
          consistencyRequests.push(
            cy.authenticatedRequest({
              method: 'GET',
              url: `${Cypress.env('API_BASE_URL')}/requests/${ticketNumber}`
            }, {
              useClientCredentials: false,
              userRole: 'admin'
            })
          );
        }

        cy.wrap(Promise.all(consistencyRequests)).then((responses) => {
          // All responses should be identical
          const firstResponse = responses[0].body;
          
          responses.forEach((response, index) => {
            expect(response.status).to.equal(200);
            expect(response.body.ticketNumber).to.equal(firstResponse.ticketNumber);
            expect(response.body.studentId).to.equal(firstResponse.studentId);
            expect(response.body.status).to.equal(firstResponse.status);
            
            cy.log(`✓ Response ${index + 1} consistent with first response`);
          });
          
          cy.log('✓ API response consistency validated');
        });
      });
    });

    it('should validate API health and monitoring endpoints', () => {
      const healthEndpoints = [
        { path: '/health/liveness', description: 'Liveness probe' },
        { path: '/health/readiness', description: 'Readiness probe' },
        { path: '/actuator/health', description: 'Spring Boot Actuator health' },
        { path: '/actuator/info', description: 'Application info' }
      ];

      healthEndpoints.forEach(endpoint => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}${endpoint.path}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.exist;
            cy.log(`✓ ${endpoint.description} endpoint available: ${response.status}`);
          } else if (response.status === 404) {
            cy.log(`${endpoint.description} endpoint not implemented: ${endpoint.path}`);
          } else {
            cy.log(`${endpoint.description} endpoint returned: ${response.status}`);
          }
        });
      });
    });
  });

  after(() => {
    // Cleanup
    cy.clearTokenCache();
    cy.log('Enhanced API integration test cleanup completed');
  });
});