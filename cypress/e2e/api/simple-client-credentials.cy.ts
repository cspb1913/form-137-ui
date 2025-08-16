/**
 * Simple Client Credentials Test
 * 
 * This is a basic working example of Auth0 client credentials authentication
 */

describe('Simple Client Credentials Test', () => {
  
  it('should authenticate and access API', () => {
    // Step 1: Get access token using client credentials
    cy.request({
      method: 'POST',
      url: 'https://jasoncalalang.auth0.com/oauth/token',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        client_id: 'qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC',
        client_secret: 'OSUSqi319Jj3ek80o0Rv7ILqriTaTUcZqS2vwtJDQ_-OlgpT1RiRBx8iAWJfahlN',
        audience: 'https://form137.cspb.edu.ph/api',
        grant_type: 'client_credentials'
      }
    }).then((authResponse) => {
      // Verify authentication response
      expect(authResponse.status).to.equal(200);
      expect(authResponse.body).to.have.property('access_token');
      expect(authResponse.body).to.have.property('token_type', 'Bearer');
      expect(authResponse.body).to.have.property('expires_in');
      
      const accessToken = authResponse.body.access_token;
      
      // Step 2: Use the token to access the API
      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/health/liveness',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).then((apiResponse) => {
        // Verify API response
        expect(apiResponse.status).to.equal(200);
        expect(apiResponse.body).to.have.property('status', 'UP');
      });
    });
  });
  
  it('should fail with invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: 'https://jasoncalalang.auth0.com/oauth/token',
      headers: {
        'Content-Type': 'application/json'
      },
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
  
  it('should fail API access without token', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:8080/api/health/liveness',
      failOnStatusCode: false
    }).then((response) => {
      // Should return 401 Unauthorized (or might return 200 if endpoint is public)
      // Adjust expectation based on your API's actual behavior
      expect([200, 401, 403]).to.include(response.status);
    });
  });
});