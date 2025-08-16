# Auth0 Programmatic Authentication Setup for E2E Testing

This guide explains how to configure Auth0 and your application for programmatic authentication in Cypress E2E tests.

## Overview

Auth0's Universal Login provides excellent security for production applications but creates challenges for automated testing. This setup implements **Resource Owner Password Grant (ROPG)** to enable programmatic authentication that bypasses the Auth0 login UI during testing.

## Architecture Flow

```
Cypress Test → Auth0 ROPG API → Access Token → Next.js App → Spring Boot API
     ↓              ↓               ↓            ↓           ↓
  Test User → Direct Auth → JWT Token → Session → Authenticated Request
```

## Prerequisites

- Auth0 account with development tenant
- Next.js application with @auth0/nextjs-auth0
- Spring Boot API with OAuth2 JWT validation
- Cypress E2E testing setup

## Auth0 Configuration Steps

### 1. Enable Resource Owner Password Grant

**In Auth0 Dashboard:**

1. Navigate to **Applications** → **Your Application**
2. Go to **Settings** → **Advanced Settings** → **Grant Types**
3. Enable **Password** grant type
4. Save changes

**⚠️ Security Note:** Only enable ROPG for testing applications, never in production.

### 2. Create Test Users

**Option A: Manual Creation (Auth0 Dashboard)**
1. Go to **User Management** → **Users**
2. Create test users with known credentials:
   - Email: `testuser@cspb.edu.ph`
   - Password: `2025@CSPB`
   - Email Verified: `true`

**Option B: Programmatic Creation (Management API)**
```javascript
const auth0Management = new Auth0ManagementAPI(
  'your-domain.auth0.com',
  'your-client-id',
  'your-client-secret'
);

await auth0Management.createTestUser({
  email: 'testuser@cspb.edu.ph',
  password: '2025@CSPB',
  name: 'Test User',
  email_verified: true
});
```

### 3. Configure Application Settings

**Application Settings:**
- **Application Type:** Single Page Application
- **Token Endpoint Authentication Method:** None
- **Allowed Callback URLs:** `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs:** `http://localhost:3000`
- **Allowed Web Origins:** `http://localhost:3000`

**Advanced Settings:**
- **JsonWebToken Signature Algorithm:** RS256
- **OIDC Conformant:** Enabled
- **Grant Types:** Authorization Code, Refresh Token, Password

### 4. API Configuration

**In Auth0 API Settings:**
- **Identifier:** `https://form137.cspb.edu.ph/api`
- **Signing Algorithm:** RS256
- **Allow Skipping User Consent:** Enabled (for testing)
- **Token Lifetime:** 86400 seconds (24 hours)

## Environment Configuration

### Cypress Environment Variables

Create `/cypress.env.json`:

```json
{
  "AUTH0_DOMAIN": "jasoncalalang.auth0.com",
  "AUTH0_CLIENT_ID": "qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC",
  "AUTH0_AUDIENCE": "https://form137.cspb.edu.ph/api",
  "AUTH0_SCOPE": "openid profile email offline_access",
  "AUTH0_TEST_USERNAME": "testuser@cspb.edu.ph",
  "AUTH0_TEST_PASSWORD": "2025@CSPB",
  "API_BASE_URL": "http://localhost:8080/api",
  "SKIP_AUTH0_TESTS": false
}
```

### Next.js Environment Variables

Create `.env.local`:

```env
AUTH0_SECRET='your-long-random-string'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://jasoncalalang.auth0.com'
AUTH0_CLIENT_ID='qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC'
AUTH0_CLIENT_SECRET='your-client-secret'
AUTH0_AUDIENCE='https://form137.cspb.edu.ph/api'
AUTH0_SCOPE='openid profile email offline_access'
```

### Spring Boot Configuration

Update `application.yml`:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://jasoncalalang.auth0.com/
          audience: https://form137.cspb.edu.ph/api

logging:
  level:
    org.springframework.security: DEBUG
    org.springframework.security.oauth2: DEBUG
```

## Usage Examples

### Basic Authentication Test

```typescript
describe('Authentication Tests', () => {
  it('should authenticate programmatically', () => {
    cy.auth0LoginAndSetSession({
      username: Cypress.env('AUTH0_TEST_USERNAME'),
      password: Cypress.env('AUTH0_TEST_PASSWORD')
    });
    
    cy.visit('/dashboard');
    cy.get('[data-cy="user-info"]').should('be.visible');
  });
});
```

### Protected Route Testing

```typescript
it('should access protected routes', () => {
  cy.visitAuthenticated('/admin/requests', {
    username: Cypress.env('AUTH0_ADMIN_USERNAME'),
    password: Cypress.env('AUTH0_ADMIN_PASSWORD')
  });
  
  cy.url().should('include', '/admin');
});
```

### API Integration Testing

```typescript
it('should make authenticated API calls', () => {
  cy.auth0LoginAndSetSession().then((tokens) => {
    cy.authenticatedRequest({
      method: 'GET',
      url: '/api/requests',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});
```

## Security Best Practices

### 1. Environment Separation

- **Development:** Use test tenant with ROPG enabled
- **Staging:** Use separate tenant with production-like settings
- **Production:** Never enable ROPG

### 2. Test User Management

```typescript
// Clean up test users after test suites
afterEach(() => {
  if (Cypress.env('CLEANUP_TEST_USERS')) {
    cy.task('cleanupTestUsers');
  }
});
```

### 3. Token Security

- Store tokens only in test environment
- Use short-lived tokens (1 hour max)
- Clear tokens after each test

### 4. Network Security

```typescript
// Only allow programmatic auth in test environment
if (!Cypress.env('CYPRESS_RUNNING')) {
  throw new Error('ROPG only allowed in test environment');
}
```

## Troubleshooting

### Common Issues

**1. ROPG Grant Not Enabled**
```
Error: grant_type not allowed
Solution: Enable Password grant in Auth0 application settings
```

**2. Invalid Credentials**
```
Error: invalid_grant
Solution: Verify test user exists and email is verified
```

**3. Token Invalid**
```
Error: JWT verification failed
Solution: Check audience, issuer, and signing algorithm
```

**4. CORS Issues**
```
Error: CORS policy blocked
Solution: Add localhost to Allowed Web Origins in Auth0
```

### Debug Mode

Enable detailed logging:

```typescript
// In cypress/support/auth0Commands.js
cy.log('Auth0 Request:', {
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  audience: auth0Config.audience
});
```

### Health Check Command

```typescript
Cypress.Commands.add('checkAuth0Health', () => {
  cy.request({
    url: `https://${Cypress.env('AUTH0_DOMAIN')}/.well-known/openid_configuration`,
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.equal(200);
    cy.log('Auth0 tenant is accessible');
  });
});
```

## Alternative Approaches

### 1. Management API Approach

For more control over test users:

```typescript
// Create/delete test users programmatically
cy.task('createTestUser', { email: 'test@example.com' });
cy.task('deleteTestUser', { userId: 'auth0|123' });
```

### 2. Mock Authentication

For faster test execution:

```typescript
if (Cypress.env('SKIP_AUTH0_TESTS')) {
  cy.mockUserSession({
    sub: 'auth0|mock-user',
    email: 'test@example.com',
    roles: ['Requester']
  });
}
```

### 3. Session Persistence

Cache authentication across tests:

```typescript
cy.session([username, password], () => {
  cy.auth0LoginAndSetSession({ username, password });
});
```

## Performance Considerations

- **Authentication Time:** ~2-5 seconds per ROPG request
- **Token Caching:** Use cy.session() for test suite optimization
- **Parallel Execution:** Each test worker needs separate credentials
- **Rate Limiting:** Auth0 limits ROPG requests (10/minute per IP)

## Monitoring and Analytics

Track test authentication metrics:

```typescript
afterEach(() => {
  cy.window().then((win) => {
    const authTime = win.authenticationDuration;
    if (authTime > 10000) {
      cy.log(`Slow authentication: ${authTime}ms`);
    }
  });
});
```

## Additional Resources

- [Auth0 Resource Owner Password Grant Documentation](https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow)
- [Cypress Session API](https://docs.cypress.io/api/commands/session)
- [Next.js Auth0 SDK Documentation](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Spring Security OAuth2 Documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)