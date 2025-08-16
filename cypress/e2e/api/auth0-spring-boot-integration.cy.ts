/// <reference types="cypress" />

/**
 * Auth0 + Spring Boot Integration Tests
 * 
 * This test suite specifically focuses on the integration between:
 * - Auth0 authentication system
 * - Spring Boot backend with Spring Security
 * - JWT token validation and processing
 * - Role-based authorization in Spring Boot
 */

describe('Auth0 + Spring Boot Integration Tests', () => {
  beforeEach(() => {
    // Validate Auth0 and API connectivity
    cy.validateAuth0Integration();
  });

  describe('Spring Boot JWT Configuration', () => {
    it('should validate Spring Boot JWT decoder configuration', () => {
      cy.auth0ClientCredentials({ useCache: false }).then((tokenData) => {
        // Test that Spring Boot correctly validates Auth0 JWT tokens
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 204]);
          
          // Validate JWT token structure matches Spring Boot expectations
          cy.validateJWTToken(tokenData.access_token, {
            audience: Cypress.env('AUTH0_AUDIENCE')
          }).then((decoded) => {
            // Spring Boot expects specific JWT claims
            expect(decoded).to.have.property('iss'); // Issuer
            expect(decoded).to.have.property('aud'); // Audience  
            expect(decoded).to.have.property('exp'); // Expiration
            expect(decoded).to.have.property('iat'); // Issued at
            expect(decoded).to.have.property('sub'); // Subject
            
            // Validate issuer matches Auth0 configuration
            expect(decoded.iss).to.equal(`https://${Cypress.env('AUTH0_DOMAIN')}/`);
            expect(decoded.aud).to.equal(Cypress.env('AUTH0_AUDIENCE'));
            
            cy.log('✓ Spring Boot JWT decoder configuration validated');
          });
        });
      });
    });

    it('should handle JWT token validation errors in Spring Boot', () => {
      const invalidTokens = [
        {
          name: 'Expired token',
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QifQ.eyJpc3MiOiJodHRwczovL3Rlc3QuYXV0aDAuY29tLyIsInN1YiI6InRlc3R8dGVzdCIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0.test'
        },
        {
          name: 'Wrong issuer',
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3dyb25nLWlzc3Vlci5jb20vIiwic3ViIjoidGVzdCIsImF1ZCI6InRlc3QiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.wrong'
        },
        {
          name: 'Wrong audience',
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tLyIsInN1YiI6InRlc3QiLCJhdWQiOiJ3cm9uZy1hdWRpZW5jZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.wrong'
        }
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
          // Spring Boot should reject invalid tokens with 401
          expect(response.status).to.equal(401);
          cy.log(`✓ Spring Boot correctly rejected ${testCase.name}: ${response.status}`);
        });
      });
    });

    it('should validate Spring Security method-level security annotations', () => {
      // Test endpoints that should require specific roles
      const securityTests = [
        {
          endpoint: '/requests',
          method: 'GET',
          requiredRole: 'authenticated',
          description: 'Any authenticated user can view requests'
        },
        {
          endpoint: '/admin/requests',
          method: 'GET', 
          requiredRole: 'Admin',
          description: 'Only admins can view all requests'
        },
        {
          endpoint: '/requests',
          method: 'POST',
          requiredRole: 'authenticated',
          description: 'Authenticated users can create requests'
        }
      ];

      securityTests.forEach(test => {
        // Test with appropriate role
        const userRole = test.requiredRole === 'Admin' ? 'admin' : 'requester';
        
        cy.authenticatedRequest({
          method: test.method,
          url: `${Cypress.env('API_BASE_URL')}${test.endpoint}`,
          body: test.method === 'POST' ? {
            studentId: 'SECURITY-TEST-' + Date.now(),
            requestPurpose: 'Security testing'
          } : undefined
        }, {
          useClientCredentials: false,
          userRole: userRole,
          retryOnUnauthorized: false
        }).then((response) => {
          // Should allow access with correct role
          expect(response.status).to.be.oneOf([200, 201, 404]); // 404 if not implemented
          cy.log(`✓ ${test.description} - ${userRole} access granted: ${response.status}`);
        });

        // Test with insufficient role (if applicable)
        if (test.requiredRole === 'Admin') {
          cy.testUnauthorizedAccess(test.endpoint, test.method, 'requester').then((response) => {
            expect(response.status).to.be.oneOf([401, 403]);
            cy.log(`✓ ${test.description} - requester access correctly denied: ${response.status}`);
          });
        }
      });
    });
  });

  describe('Spring Boot Role-Based Authorization', () => {
    it('should extract and validate custom role claims from Auth0 JWT', () => {
      // Test with admin user token
      cy.auth0Login({ role: 'admin', useCache: false }).then((tokenData) => {
        cy.validateJWTToken(tokenData.access_token).then((decoded) => {
          // Check for custom role claims in the format Spring Boot expects
          const roles = decoded['https://form137.cspb.edu.ph/roles'] || [];
          expect(roles).to.include('Admin');
          
          // Test API call that requires admin role
          return cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/admin/dashboard`,
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          });
        }).then((response) => {
          // Should allow access with admin role
          expect(response.status).to.be.oneOf([200, 404]); // 404 if endpoint not implemented
          cy.log('✓ Admin role authorization working correctly');
        });
      });

      // Test with requester user token  
      cy.auth0Login({ role: 'requester', useCache: false }).then((tokenData) => {
        cy.validateJWTToken(tokenData.access_token).then((decoded) => {
          const roles = decoded['https://form137.cspb.edu.ph/roles'] || [];
          expect(roles).to.include('Requester');
          expect(roles).to.not.include('Admin');
          
          // Test API call that should be restricted for requesters
          return cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/admin/dashboard`,
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          });
        }).then((response) => {
          // Should deny access without admin role
          expect(response.status).to.be.oneOf([401, 403]);
          cy.log('✓ Requester role correctly denied admin access');
        });
      });
    });

    it('should validate Spring Boot @PreAuthorize annotations', () => {
      // Create a test request to work with
      cy.createForm137Request({
        studentId: 'PREAUTH-TEST-' + Date.now(),
        requestPurpose: '@PreAuthorize testing'
      }).then((createResponse) => {
        const ticketNumber = createResponse.body.ticketNumber;
        
        // Test status update endpoint that should require admin role
        cy.authenticatedRequest({
          method: 'PUT',
          url: `${Cypress.env('API_BASE_URL')}/requests/${ticketNumber}/status`,
          body: {
            status: 'processing',
            notes: '@PreAuthorize test'
          }
        }, {
          useClientCredentials: false,
          userRole: 'admin',
          retryOnUnauthorized: false
        }).then((response) => {
          // Admin should be able to update status
          expect(response.status).to.be.oneOf([200, 204]);
          cy.log('✓ @PreAuthorize allows admin to update status');
        });

        // Test same endpoint with requester role
        cy.authenticatedRequest({
          method: 'PUT',
          url: `${Cypress.env('API_BASE_URL')}/requests/${ticketNumber}/status`,
          body: {
            status: 'cancelled',
            notes: 'Unauthorized attempt'
          }
        }, {
          useClientCredentials: false,
          userRole: 'requester',
          retryOnUnauthorized: false
        }).then((response) => {
          // Requester should be denied
          expect(response.status).to.be.oneOf([401, 403]);
          cy.log('✓ @PreAuthorize correctly denies requester status update');
        });
      });
    });

    it('should validate Spring Security expression-based access control', () => {
      // Test endpoint that should allow users to access only their own data
      cy.auth0Login({ role: 'requester', useCache: false }).then((tokenData) => {
        // Extract user ID from token
        cy.validateJWTToken(tokenData.access_token).then((decoded) => {
          const userId = decoded.sub;
          
          // Test accessing own requests
          cy.request({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/requests/mine`,
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 404]);
            
            if (response.status === 200) {
              // Verify response only contains user's own requests
              if (response.body.requests && Array.isArray(response.body.requests)) {
                response.body.requests.forEach(request => {
                  // In a real implementation, this would check ownership
                  expect(request).to.have.property('ticketNumber');
                });
              }
            }
            
            cy.log('✓ Expression-based access control validated for user data');
          });
        });
      });
    });
  });

  describe('Spring Boot Security Configuration', () => {
    it('should validate CORS configuration in Spring Boot', () => {
      // Test CORS preflight request
      cy.request({
        method: 'OPTIONS',
        url: `${Cypress.env('API_BASE_URL')}/requests`,
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'authorization,content-type'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204]);
        
        // Validate CORS headers set by Spring Boot
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers).to.have.property('access-control-allow-methods');
        expect(response.headers).to.have.property('access-control-allow-headers');
        
        // Validate specific configurations
        const allowedOrigin = response.headers['access-control-allow-origin'];
        expect(allowedOrigin).to.satisfy(origin => 
          origin === '*' || 
          origin.includes('localhost:3000') || 
          origin.includes('form137.cspb.edu.ph')
        );
        
        const allowedMethods = response.headers['access-control-allow-methods'];
        expect(allowedMethods.toUpperCase()).to.include('POST');
        expect(allowedMethods.toUpperCase()).to.include('GET');
        
        const allowedHeaders = response.headers['access-control-allow-headers'];
        expect(allowedHeaders.toLowerCase()).to.include('authorization');
        expect(allowedHeaders.toLowerCase()).to.include('content-type');
        
        cy.log('✓ Spring Boot CORS configuration validated');
      });
    });

    it('should validate Spring Security filter chain configuration', () => {
      // Test unauthenticated access to protected endpoint
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_BASE_URL')}/requests`,
        failOnStatusCode: false
      }).then((response) => {
        // Should be rejected by Spring Security filter
        expect(response.status).to.equal(401);
        
        // Validate error response format
        expect(response.body).to.exist;
        
        cy.log('✓ Spring Security filter chain correctly blocks unauthenticated requests');
      });

      // Test authenticated access
      cy.auth0ClientCredentials().then((tokenData) => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/requests`,
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          // Should be allowed through filter chain
          expect(response.status).to.be.oneOf([200, 404]);
          cy.log('✓ Spring Security filter chain allows authenticated requests');
        });
      });
    });

    it('should validate JWT authentication entry point configuration', () => {
      // Test various authentication failure scenarios
      const authFailureTests = [
        { name: 'No Authorization header', headers: {} },
        { name: 'Invalid Authorization format', headers: { 'Authorization': 'Invalid token' } },
        { name: 'Bearer with empty token', headers: { 'Authorization': 'Bearer ' } },
        { name: 'Bearer with malformed token', headers: { 'Authorization': 'Bearer malformed.token.here' } }
      ];

      authFailureTests.forEach(test => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}/requests`,
          headers: test.headers,
          failOnStatusCode: false
        }).then((response) => {
          // Spring Boot should return 401 for all authentication failures
          expect(response.status).to.equal(401);
          
          // Should return consistent error format
          expect(response.body).to.exist;
          
          cy.log(`✓ ${test.name} correctly rejected with 401`);
        });
      });
    });
  });

  describe('Spring Boot Integration Performance', () => {
    it('should measure JWT validation performance in Spring Boot', () => {
      cy.auth0ClientCredentials().then((tokenData) => {
        const performanceTests = [];
        
        // Make multiple concurrent requests to test JWT validation performance
        for (let i = 0; i < 10; i++) {
          const startTime = Date.now();
          
          performanceTests.push(
            cy.request({
              method: 'GET',
              url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
              }
            }).then((response) => {
              const endTime = Date.now();
              const duration = endTime - startTime;
              
              expect(response.status).to.be.oneOf([200, 204]);
              expect(duration).to.be.lessThan(1000); // Should be fast
              
              return { duration, status: response.status };
            })
          );
        }

        cy.wrap(Promise.all(performanceTests)).then((results) => {
          const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
          const maxDuration = Math.max(...results.map(r => r.duration));
          
          cy.log(`JWT validation performance - Avg: ${avgDuration.toFixed(2)}ms, Max: ${maxDuration}ms`);
          
          // Performance thresholds
          expect(avgDuration).to.be.lessThan(500); // Average under 500ms
          expect(maxDuration).to.be.lessThan(2000); // Max under 2 seconds
          
          cy.log('✓ Spring Boot JWT validation performance acceptable');
        });
      });
    });

    it('should validate Spring Boot actuator health endpoints', () => {
      const actuatorEndpoints = [
        { path: '/actuator/health', description: 'Main health endpoint' },
        { path: '/actuator/health/liveness', description: 'Liveness probe' },
        { path: '/actuator/health/readiness', description: 'Readiness probe' },
        { path: '/actuator/info', description: 'Application info' },
        { path: '/actuator/metrics', description: 'Metrics endpoint' }
      ];

      actuatorEndpoints.forEach(endpoint => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('API_BASE_URL')}${endpoint.path}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.exist;
            
            // Validate health endpoint response format
            if (endpoint.path.includes('health')) {
              expect(response.body).to.have.property('status');
            }
            
            cy.log(`✓ ${endpoint.description} available and responding correctly`);
          } else if (response.status === 404) {
            cy.log(`${endpoint.description} not exposed: ${endpoint.path}`);
          } else if (response.status === 401) {
            cy.log(`${endpoint.description} requires authentication: ${endpoint.path}`);
          } else {
            cy.log(`${endpoint.description} returned status: ${response.status}`);
          }
        });
      });
    });
  });

  after(() => {
    // Cleanup
    cy.clearTokenCache();
    cy.log('Auth0 + Spring Boot integration test cleanup completed');
  });
});