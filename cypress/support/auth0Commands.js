/**
 * Auth0 Programmatic Authentication Commands for Cypress
 * Supports both Client Credentials and Resource Owner Password Grant flows for E2E testing
 */

// Auth0 configuration - should match your environment variables
const auth0Config = {
  domain: 'jasoncalalang.auth0.com',
  clientId: 'qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC',
  clientSecret: 'OSUSqi319Jj3ek80o0Rv7ILqriTaTUcZqS2vwtJDQ_-OlgpT1RiRBx8iAWJfahlN',
  audience: 'https://form137.cspb.edu.ph/api',
  scope: 'openid profile email offline_access',
  testUser: {
    username: 'testuser@cspb.edu.ph',
    password: '2025@CSPB'
  }
};

// Token cache for performance optimization
let tokenCache = {
  access_token: null,
  expires_at: null,
  id_token: null
};

/**
 * Authenticates using Auth0's Client Credentials Grant
 * This is the preferred method for E2E testing as it's more reliable and doesn't require real user credentials
 * Returns access token for API calls
 */
Cypress.Commands.add('auth0ClientCredentials', (options = {}) => {
  const {
    audience = auth0Config.audience,
    useCache = true
  } = options;

  // Check cache first if enabled
  if (useCache && tokenCache.access_token && tokenCache.expires_at > Date.now()) {
    cy.log('Using cached access token');
    return cy.wrap(tokenCache);
  }

  cy.log('Authenticating with Auth0 via Client Credentials...');
  
  return cy.request({
    method: 'POST',
    url: `https://${auth0Config.domain}/oauth/token`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      client_id: auth0Config.clientId,
      client_secret: auth0Config.clientSecret,
      audience: audience,
      grant_type: 'client_credentials'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Auth0 client credentials authentication failed: ${response.body.error_description || response.body.error}`);
    }

    const { access_token, expires_in, token_type = 'Bearer' } = response.body;
    
    // Cache the token
    tokenCache = {
      access_token,
      expires_at: Date.now() + (expires_in * 1000) - 30000, // 30 second buffer
      token_type,
      expires_in
    };

    cy.log(`Access token obtained, expires in ${expires_in} seconds`);
    
    return cy.wrap(tokenCache);
  });
});

/**
 * Authenticates using Auth0's Resource Owner Password Grant
 * Returns access token, ID token, and user info
 * NOTE: This method requires password grant to be enabled and is less reliable for testing
 */
Cypress.Commands.add('auth0Login', (options = {}) => {
  const {
    username = auth0Config.testUser.username,
    password = auth0Config.testUser.password,
    scope = auth0Config.scope,
    audience = auth0Config.audience
  } = options;

  cy.log('Authenticating with Auth0 via ROPG...');
  
  return cy.request({
    method: 'POST',
    url: `https://${auth0Config.domain}/oauth/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
      grant_type: 'password',
      username: username,
      password: password,
      audience: audience,
      scope: scope,
      client_id: auth0Config.clientId
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Auth0 authentication failed: ${response.body.error_description || response.body.error}`);
    }

    const { access_token, id_token, refresh_token, expires_in } = response.body;
    
    // Store tokens for use in subsequent requests
    cy.window().then((win) => {
      win.localStorage.setItem('auth0.access_token', access_token);
      win.localStorage.setItem('auth0.id_token', id_token);
      if (refresh_token) {
        win.localStorage.setItem('auth0.refresh_token', refresh_token);
      }
      win.localStorage.setItem('auth0.expires_at', (Date.now() + expires_in * 1000).toString());
    });

    return {
      access_token,
      id_token,
      refresh_token,
      expires_in
    };
  });
});

/**
 * Sets up Auth0 session in the browser without going through login flow
 * This mimics what @auth0/nextjs-auth0 does after successful authentication
 */
Cypress.Commands.add('auth0SetSession', (tokens) => {
  const { access_token, id_token, refresh_token } = tokens;
  
  cy.log('Setting up Auth0 session...');
  
  // Decode ID token to get user info (simple base64 decode for testing)
  const idTokenPayload = JSON.parse(atob(id_token.split('.')[1]));
  
  cy.window().then((win) => {
    // Set localStorage items that @auth0/nextjs-auth0 expects
    const authState = {
      access_token,
      id_token,
      refresh_token,
      expires_at: idTokenPayload.exp * 1000,
      user: {
        sub: idTokenPayload.sub,
        email: idTokenPayload.email,
        name: idTokenPayload.name || idTokenPayload.email,
        picture: idTokenPayload.picture,
        email_verified: idTokenPayload.email_verified
      },
      isAuthenticated: true
    };
    
    // Store in the format Next.js Auth0 SDK expects
    win.localStorage.setItem('auth0.user', JSON.stringify(authState.user));
    win.localStorage.setItem('auth0.isAuthenticated', 'true');
    win.localStorage.setItem('auth0.access_token', access_token);
    win.localStorage.setItem('auth0.id_token', id_token);
  });
});

/**
 * Complete auth flow: authenticate and set session
 */
Cypress.Commands.add('auth0LoginAndSetSession', (options = {}) => {
  return cy.auth0Login(options).then((tokens) => {
    cy.auth0SetSession(tokens);
    return tokens;
  });
});

/**
 * Logout and clear Auth0 session
 */
Cypress.Commands.add('auth0Logout', () => {
  cy.log('Clearing Auth0 session...');
  
  cy.window().then((win) => {
    // Clear all Auth0-related localStorage items
    const keysToRemove = Object.keys(win.localStorage)
      .filter(key => key.startsWith('auth0.'));
    
    keysToRemove.forEach(key => {
      win.localStorage.removeItem(key);
    });
  });
});

/**
 * Make authenticated API request to your Spring Boot backend
 * Uses client credentials by default for reliable testing
 */
Cypress.Commands.add('authenticatedRequest', (requestOptions, authOptions = {}) => {
  const { 
    useClientCredentials = true,
    useCachedToken = true 
  } = authOptions;

  if (useClientCredentials) {
    // Use client credentials flow for API testing
    return cy.auth0ClientCredentials({ useCache: useCachedToken }).then((tokenData) => {
      return cy.request({
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
    });
  } else {
    // Fallback to browser-stored token (for UI testing scenarios)
    return cy.window().then((win) => {
      const accessToken = win.localStorage.getItem('auth0.access_token');
      
      if (!accessToken) {
        throw new Error('No access token found. Please authenticate first.');
      }
      
      return cy.request({
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
    });
  }
});

/**
 * Make authenticated API request using stored browser token
 * Useful for testing user-context scenarios
 */
Cypress.Commands.add('authenticatedRequestFromBrowser', (requestOptions) => {
  return cy.authenticatedRequest(requestOptions, { useClientCredentials: false });
});

/**
 * Visit page with authentication bypass
 * Useful for testing protected routes without going through login flow
 */
Cypress.Commands.add('visitAuthenticated', (url, options = {}) => {
  return cy.auth0LoginAndSetSession(options).then(() => {
    cy.visit(url);
  });
});

/**
 * Clear token cache - useful for testing token expiration scenarios
 */
Cypress.Commands.add('clearTokenCache', () => {
  cy.log('Clearing token cache...');
  tokenCache = {
    access_token: null,
    expires_at: null,
    id_token: null
  };
});

/**
 * Test API health endpoint with authentication
 */
Cypress.Commands.add('testAPIHealth', (options = {}) => {
  const { baseUrl = Cypress.env('API_BASE_URL') || 'http://localhost:8080/api' } = options;
  
  return cy.authenticatedRequest({
    method: 'GET',
    url: `${baseUrl}/health/liveness`,
    failOnStatusCode: false
  }).then((response) => {
    cy.log(`API Health Status: ${response.status}`);
    return response;
  });
});

/**
 * Create a Form 137 request via API (useful for setting up test data)
 */
Cypress.Commands.add('createForm137Request', (requestData = {}) => {
  const defaultData = {
    studentId: 'TEST-' + Date.now(),
    requestPurpose: 'Cypress E2E Testing',
    urgencyLevel: 'REGULAR',
    additionalNotes: 'Automated test request'
  };

  const testData = { ...defaultData, ...requestData };
  
  return cy.authenticatedRequest({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/form137/requests`,
    body: testData
  }).then((response) => {
    cy.log(`Created Form 137 request: ${response.body.ticketNumber}`);
    return response;
  });
});

/**
 * Get Form 137 requests via API
 */
Cypress.Commands.add('getForm137Requests', (options = {}) => {
  const { page = 0, size = 10, ...queryParams } = options;
  
  return cy.authenticatedRequest({
    method: 'GET',
    url: `${Cypress.env('API_BASE_URL')}/form137/requests`,
    qs: { page, size, ...queryParams }
  });
});

/**
 * Update Form 137 request status via API (admin function)
 */
Cypress.Commands.add('updateForm137Status', (ticketNumber, newStatus, notes = '') => {
  return cy.authenticatedRequest({
    method: 'PATCH',
    url: `${Cypress.env('API_BASE_URL')}/form137/requests/${ticketNumber}/status`,
    body: {
      status: newStatus,
      notes: notes
    }
  });
});