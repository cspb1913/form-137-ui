/**
 * Form 137 API Tests using Auth0 Client Credentials
 * 
 * This test suite demonstrates how to use client credentials authentication
 * for reliable API testing without user interaction
 */

describe('Form 137 API - Client Credentials Authentication', () => {
  
  beforeEach(() => {
    // Clear any cached tokens to ensure fresh authentication
    cy.clearTokenCache();
  });

  describe('Authentication', () => {
    it('should obtain access token using client credentials', () => {
      cy.auth0ClientCredentials().then((tokenData) => {
        expect(tokenData).to.have.property('access_token');
        expect(tokenData).to.have.property('expires_in');
        expect(tokenData).to.have.property('token_type', 'Bearer');
        expect(tokenData.access_token).to.be.a('string').and.not.be.empty;
        
        // Verify token is valid for at least 1 hour
        expect(tokenData.expires_in).to.be.greaterThan(3600);
      });
    });

    it('should cache tokens for performance', () => {
      // First call - should hit Auth0
      const startTime = Date.now();
      cy.auth0ClientCredentials().then(() => {
        const firstCallTime = Date.now() - startTime;
        
        // Second call - should use cache
        const cacheStartTime = Date.now();
        cy.auth0ClientCredentials().then(() => {
          const cacheCallTime = Date.now() - cacheStartTime;
          
          // Cache call should be significantly faster
          expect(cacheCallTime).to.be.lessThan(firstCallTime / 2);
        });
      });
    });

    it('should handle authentication failures gracefully', () => {
      // Test with invalid client secret
      cy.request({
        method: 'POST',
        url: 'https://jasoncalalang.auth0.com/oauth/token',
        headers: { 'Content-Type': 'application/json' },
        body: {
          client_id: 'invalid-client-id',
          client_secret: 'invalid-secret',
          audience: 'https://form137.cspb.edu.ph/api',
          grant_type: 'client_credentials'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error');
      });
    });
  });

  describe('API Health Checks', () => {
    it('should verify API is accessible with authentication', () => {
      cy.testAPIHealth().then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('status', 'UP');
      });
    });

    it('should fail without authentication', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_BASE_URL')}/health/liveness`,
        failOnStatusCode: false
      }).then((response) => {
        // Should return 401 Unauthorized
        expect([401, 403]).to.include(response.status);
      });
    });
  });

  describe('Form 137 Request Management', () => {
    let testRequestTicket: string;

    it('should create a new Form 137 request', () => {
      const requestData = {
        studentId: 'CYPRESS-TEST-' + Date.now(),
        requestPurpose: 'Employment',
        urgencyLevel: 'URGENT',
        additionalNotes: 'E2E test request created via client credentials'
      };

      cy.createForm137Request(requestData).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('ticketNumber');
        expect(response.body).to.have.property('status', 'PENDING');
        expect(response.body.studentId).to.equal(requestData.studentId);
        
        testRequestTicket = response.body.ticketNumber;
      });
    });

    it('should retrieve Form 137 requests', () => {
      cy.getForm137Requests({ page: 0, size: 5 }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('content');
        expect(response.body).to.have.property('totalElements');
        expect(response.body).to.have.property('totalPages');
        expect(response.body.content).to.be.an('array');
      });
    });

    it('should update request status', function() {
      // Skip if no test request was created
      if (!testRequestTicket) {
        this.skip();
      }

      cy.updateForm137Status(testRequestTicket, 'IN_PROGRESS', 'Processing via E2E test')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('status', 'IN_PROGRESS');
          expect(response.body).to.have.property('ticketNumber', testRequestTicket);
        });
    });

    it('should handle invalid request IDs', () => {
      cy.authenticatedRequest({
        method: 'GET',
        url: `${Cypress.env('API_BASE_URL')}/form137/requests/INVALID-TICKET`,
        failOnStatusCode: false
      }).then((response) => {
        expect([404, 400]).to.include(response.status);
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent API calls', () => {
      const promises = [];
      
      // Create 5 concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          cy.authenticatedRequest({
            method: 'GET',
            url: `${Cypress.env('API_BASE_URL')}/health/liveness`
          })
        );
      }

      // All requests should succeed
      cy.wrap(Promise.all(promises)).then((responses) => {
        responses.forEach((response) => {
          expect(response.status).to.equal(200);
        });
      });
    });

    it('should reuse cached tokens for multiple requests', () => {
      // Make multiple API calls - should use same token
      cy.authenticatedRequest({
        method: 'GET',
        url: `${Cypress.env('API_BASE_URL')}/health/liveness`
      }).then(() => {
        cy.getForm137Requests({ size: 1 }).then(() => {
          cy.testAPIHealth().then((response) => {
            expect(response.status).to.equal(200);
          });
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API server errors gracefully', () => {
      cy.authenticatedRequest({
        method: 'GET',
        url: `${Cypress.env('API_BASE_URL')}/nonexistent-endpoint`,
        failOnStatusCode: false
      }).then((response) => {
        expect([404, 405]).to.include(response.status);
      });
    });

    it('should handle malformed request data', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: `${Cypress.env('API_BASE_URL')}/form137/requests`,
        body: {
          // Missing required fields
          invalidField: 'test'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  after(() => {
    // Cleanup: Clear token cache after all tests
    cy.clearTokenCache();
  });
});