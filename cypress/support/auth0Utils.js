/**
 * Advanced Auth0 Testing Utilities
 * Includes Management API integration, token validation, and test user management
 */

/**
 * Auth0 Management API utilities for advanced testing scenarios
 */
export class Auth0ManagementAPI {
  constructor(domain, clientId, clientSecret) {
    this.domain = domain;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.managementToken = null;
  }

  /**
   * Get Management API access token
   */
  async getManagementToken() {
    if (this.managementToken && !this.isTokenExpired(this.managementToken)) {
      return this.managementToken;
    }

    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: `https://${this.domain}/api/v2/`,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get management token: ${response.statusText}`);
    }

    const data = await response.json();
    this.managementToken = data.access_token;
    return this.managementToken;
  }

  /**
   * Create a test user programmatically
   */
  async createTestUser(userProfile) {
    const token = await this.getManagementToken();
    
    const response = await fetch(`https://${this.domain}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connection: 'Username-Password-Authentication',
        email: userProfile.email,
        password: userProfile.password,
        name: userProfile.name,
        email_verified: true,
        app_metadata: userProfile.app_metadata || {},
        user_metadata: userProfile.user_metadata || {}
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Delete a test user
   */
  async deleteTestUser(userId) {
    const token = await this.getManagementToken();
    
    const response = await fetch(`https://${this.domain}/api/v2/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const token = await this.getManagementToken();
    
    const response = await fetch(
      `https://${this.domain}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`);
    }

    const users = await response.json();
    return users.length > 0 ? users[0] : null;
  }

  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

/**
 * Token validation utilities
 */
export class TokenValidator {
  /**
   * Validate JWT token structure and basic claims
   */
  static validateToken(token, expectedAudience = null) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error('Token is expired');
      }

      // Check audience if provided
      if (expectedAudience && payload.aud !== expectedAudience) {
        throw new Error(`Invalid audience. Expected: ${expectedAudience}, Got: ${payload.aud}`);
      }

      return {
        header,
        payload,
        isValid: true
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Extract user permissions from token
   */
  static extractPermissions(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.permissions || payload.scope?.split(' ') || [];
    } catch {
      return [];
    }
  }
}

/**
 * Test environment utilities
 */
export class TestEnvironment {
  /**
   * Check if running in test environment
   */
  static isTestEnvironment() {
    return (
      typeof window !== 'undefined' && 
      window.Cypress || 
      process.env.NODE_ENV === 'test' ||
      process.env.CYPRESS_RUNNING === 'true'
    );
  }

  /**
   * Get test-specific configuration
   */
  static getTestConfig() {
    return {
      auth0: {
        domain: 'jasoncalalang.auth0.com',
        clientId: 'qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC',
        audience: 'https://form137.cspb.edu.ph/api',
        testUser: {
          username: 'testuser@cspb.edu.ph',
          password: '2025@CSPB'
        }
      },
      api: {
        baseUrl: 'http://localhost:8080/api' // Your Spring Boot API
      }
    };
  }
}

/**
 * API testing helpers for authenticated requests
 */
export class AuthenticatedAPITester {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  /**
   * Make authenticated GET request
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  /**
   * Make authenticated POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  /**
   * Make authenticated PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  /**
   * Make authenticated DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  /**
   * Generic authenticated request method
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }
}

/**
 * Session management utilities
 */
export class SessionManager {
  /**
   * Simulate Next.js Auth0 session state
   */
  static createSessionState(tokens, userInfo) {
    return {
      user: userInfo,
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: Date.now() + (tokens.expires_in * 1000),
      isAuthenticated: true
    };
  }

  /**
   * Store session in localStorage (for testing purposes)
   */
  static storeSession(sessionState) {
    if (typeof window !== 'undefined') {
      Object.entries(sessionState).forEach(([key, value]) => {
        localStorage.setItem(`auth0.${key}`, JSON.stringify(value));
      });
    }
  }

  /**
   * Clear session from localStorage
   */
  static clearSession() {
    if (typeof window !== 'undefined') {
      const keysToRemove = Object.keys(localStorage)
        .filter(key => key.startsWith('auth0.'));
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
}