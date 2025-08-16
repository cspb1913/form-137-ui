# Cypress E2E Testing Setup for Form 137 Request Portal

This directory contains comprehensive end-to-end tests for the Form 137 Request Portal application using Cypress.

## Overview

The test suite covers:
- **Authentication flows** with Auth0 integration
- **Role-based access control** (Admin vs Requester)
- **Form submission workflows** for Form 137 requests
- **Protected route access control** and security
- **Admin dashboard functionality** and management features
- **API integration** with the backend service

## Directory Structure

```
cypress/
├── e2e/                    # End-to-end test specifications
│   ├── auth/              # Authentication-related tests
│   ├── workflows/         # Form submission workflows
│   ├── admin/            # Admin functionality tests
│   └── security/         # Security and access control tests
├── fixtures/             # Test data and mock responses
├── support/              # Support files and custom commands
│   ├── commands.ts       # Custom Cypress commands
│   ├── e2e.ts           # Global test configuration
│   └── component.ts     # Component testing setup
└── README.md            # This file
```

## Configuration

### Environment Variables

Create a `cypress.env.json` file in the project root or set environment variables:

```json
{
  "API_BASE_URL": "http://localhost:8080/api",
  "AUTH0_DOMAIN": "jasoncalalang.auth0.com",
  "AUTH0_CLIENT_ID": "qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC",
  "AUTH0_CLIENT_SECRET": "OSUSqi319Jj3ek80o0Rv7ILqriTaTUcZqS2vwtJDQ_-OlgpT1RiRBx8iAWJfahlN",
  "AUTH0_AUDIENCE": "https://form137.cspb.edu.ph/api",
  "AUTH0_ADMIN_USERNAME": "admin@cspb.edu.ph",
  "AUTH0_ADMIN_PASSWORD": "secure-admin-password",
  "AUTH0_REQUESTER_USERNAME": "requester@cspb.edu.ph",
  "AUTH0_REQUESTER_PASSWORD": "secure-requester-password",
  "SKIP_AUTH0_TESTS": false,
  "COVERAGE": true,
  "AUTH_METHOD": "client_credentials"
}
```

**Note**: The `AUTH0_CLIENT_SECRET` is required for client credentials authentication. This should be stored securely in production environments and never committed to version control.

### Required Dependencies

The following dependencies are required:
- `cypress` - Main testing framework
- `@cypress/code-coverage` - Code coverage reporting
- `start-server-and-test` - Starts dev server before tests

## Running Tests

### Development

```bash
# Open Cypress Test Runner (interactive)
pnpm cypress:open

# Run all tests in headless mode
pnpm cypress:run

# Run tests with different browsers
pnpm cypress:run:chrome
pnpm cypress:run:firefox
pnpm cypress:run:edge

# Run with development server
pnpm test:e2e:open    # Interactive with dev server
pnpm test:e2e        # Headless with dev server
```

### Enhanced Test Categories

#### Security and Authentication Tests
```bash
# Run comprehensive Auth0 security tests
npx cypress run --spec "cypress/e2e/security/auth0-security-comprehensive.cy.ts"

# Run enhanced role-based access control tests
npx cypress run --spec "cypress/e2e/auth/role-based-routing.cy.ts"

# Run all security tests
npx cypress run --spec "cypress/e2e/security/*"
```

#### API Integration Tests
```bash
# Run enhanced API integration tests
npx cypress run --spec "cypress/e2e/api/enhanced-api-integration.cy.ts"

# Run Auth0 + Spring Boot integration tests
npx cypress run --spec "cypress/e2e/api/auth0-spring-boot-integration.cy.ts"

# Run client credentials tests specifically
./test-client-credentials.sh                    # Run with setup validation
npx cypress run --spec "cypress/e2e/api/*"      # All API tests

# Run enhanced test suite
./cypress/scripts/run-enhanced-tests.sh api     # API tests only
./cypress/scripts/run-enhanced-tests.sh         # All enhanced tests
```

#### Comprehensive Workflow Tests
```bash
# Run complete Form 137 lifecycle tests
npx cypress run --spec "cypress/e2e/workflows/comprehensive-form137-lifecycle.cy.ts"

# Run all workflow tests
npx cypress run --spec "cypress/e2e/workflows/*"

# Run form submission tests
npx cypress run --spec "cypress/e2e/workflows/form-137-submission.cy.ts"
```

#### Authentication Tests
```bash
# Run all authentication tests
npx cypress run --spec "cypress/e2e/auth/*"

# Run specific authentication patterns
npx cypress run --spec "cypress/e2e/auth/authentication.cy.ts"
npx cypress run --spec "cypress/e2e/auth/auth0-fix-validation.cy.ts"
```

### CI/CD

```bash
# Production build with headless tests
pnpm test:e2e:ci

# Run with recording (requires Cypress Dashboard)
pnpm cypress:run:record
```

## Test Categories

### 1. Authentication Tests (`auth/`)

#### `authentication.cy.ts`
- Unauthenticated user experience
- Login/logout flows
- Session management
- Auth0 integration tests
- Error handling and edge cases

#### `role-based-routing.cy.ts`
- Admin role access control
- Requester role restrictions  
- Multi-role handling
- Route protection verification
- Enhanced security and access control
- Privilege escalation prevention
- Session integrity validation

#### `auth0-fix-validation.cy.ts`
- Auth0 configuration validation
- JWT token debugging
- Authentication flow verification

### 2. Workflow Tests (`workflows/`)

#### `form-137-submission.cy.ts`
- Complete form submission flow
- Form validation and error handling
- File upload functionality
- Success/failure scenarios
- Accessibility testing
- Data persistence and handling

#### `comprehensive-form137-lifecycle.cy.ts` (NEW)
- Complete Form 137 request lifecycle testing
- Cross-role integration (Requester → Admin workflow)
- Real-time status updates and notifications
- Concurrent operations and performance testing
- Error handling and edge cases
- End-to-end Auth0 authentication flows

#### `form-137-client-credentials-integration.cy.ts`
- API-first testing with client credentials
- Frontend-backend integration validation
- Data consistency between UI and API operations

### 3. Admin Tests (`admin/`)

#### `admin-dashboard.cy.ts`
- Dashboard overview and navigation
- Request management and status updates
- Search and filtering functionality
- Bulk operations (if implemented)
- Data export features
- Responsive design testing
- Performance and loading states

### 4. Security Tests (`security/`)

#### `protected-routes.cy.ts`
- Route protection mechanisms
- API endpoint security
- CSRF protection
- Rate limiting
- Content Security Policy compliance
- Session security

#### `auth0-security-comprehensive.cy.ts` (NEW)
- Comprehensive Auth0 security validation
- JWT token security and validation
- Role-based access control (RBAC) testing
- API security and CORS validation
- Session management and edge cases
- Performance and scalability testing
- Authentication error recovery

### 5. API Integration Tests (`api/`)

#### `enhanced-api-integration.cy.ts` (NEW)
- Enhanced JWT token validation with Spring Boot
- API endpoint security and role-based access control
- CORS configuration validation
- Error handling and resilience testing
- Performance and scalability testing
- Request/response data validation

#### `auth0-spring-boot-integration.cy.ts` (NEW)
- Specific Auth0 + Spring Boot integration testing
- JWT decoder configuration validation
- Spring Security method-level security testing
- @PreAuthorize annotation validation
- Spring Boot actuator health endpoints
- Performance testing of JWT validation

#### `form-137-api-client-credentials.cy.ts`
- Client credentials authentication flow
- API-first testing approach
- Machine-to-machine authentication patterns

#### `simple-client-credentials.cy.ts`
- Basic client credentials setup validation
- API connectivity testing

## Custom Commands

The test suite includes custom Cypress commands for common operations:

### Authentication Commands

#### Enhanced Client Credentials (Recommended for API Testing)
```typescript
cy.auth0ClientCredentials()                         // Get access token via client credentials
cy.auth0ClientCredentials({ useCache: false })      // Force fresh token
cy.clearTokenCache()                                // Clear all cached tokens
cy.clearTokenCache({ userOnly: true })              // Clear only user tokens
cy.authenticatedRequest(requestOptions, authOptions) // Make authenticated API request
cy.authenticatedRequestFromBrowser(requestOptions)   // Use browser-stored token
```

#### Enhanced User Authentication (For UI Testing)
```typescript
cy.loginByAuth0({ role: 'admin' })     // Login as admin user
cy.loginAsAdmin()                      // Shorthand for admin login
cy.loginAsRequester()                  // Login as requester user
cy.logoutUser()                        // Logout current user
cy.mockUserSession(userFixture)        // Mock authentication state

// New enhanced commands
cy.auth0Login({ role: 'admin', useCache: false })   // Role-based authentication
cy.validateJWTToken(token, expectedClaims)          // Validate JWT structure and claims
cy.testTokenExpiration('requester')                 // Test token expiration handling
```

#### Security Testing Commands
```typescript
cy.testUnauthorizedAccess('/admin/endpoint', 'GET', 'requester') // Test access control
cy.testCORSAndSecurity('/api/endpoint')                          // Test CORS headers
cy.validateAuth0Integration()                                    // Comprehensive Auth0 health check
```

### Form and API Commands
```typescript
cy.fillForm137WithTestData(overrides)  // Fill Form 137 with test data
cy.setupForm137Interceptors()          // Setup API mocks
cy.createForm137Request(requestData)   // Create Form 137 request via API
cy.getForm137Requests(options)         // Get Form 137 requests via API
cy.updateForm137Status(ticket, status) // Update request status via API
cy.testAPIHealth(options)              // Test API health endpoint
cy.waitForApiResponse(alias)           // Wait for API response
```

### Utility Commands
```typescript
cy.shouldBeOnPage(path)                // Verify current page
cy.checkToast(message, type)           // Verify toast notifications
cy.verifyDashboardData()               // Verify dashboard loaded correctly
```

## Data Fixtures

Test data is stored in `fixtures/` directory:

- `user-admin.json` - Admin user data
- `user-requester.json` - Requester user data  
- `user-no-roles.json` - User without roles
- `api-responses.json` - Mock API responses
- `form-137-data.json` - Sample form data

## Best Practices

### 1. Test Independence
- Each test runs independently
- No shared state between tests
- Proper setup/teardown in `beforeEach`

### 2. Element Selection
- Use `data-cy` attributes for reliable element selection
- Avoid brittle CSS selectors
- Consistent naming conventions

### 3. API Testing
- Mock external API calls with `cy.intercept()`
- Test both success and error scenarios
- Validate request/response data

### 4. Authentication Strategy
- **Client Credentials**: Use for API testing - more reliable and faster
- **User Authentication**: Use for UI testing that requires specific user context
- Use `cy.session()` for efficient authentication caching
- Mock authentication for faster test execution
- Test both real Auth0 flows and mocked states

### 5. Enhanced Auth0 Testing Patterns

#### Client Credentials Testing
- Use `cy.auth0ClientCredentials()` for reliable API authentication
- Enhanced token caching with expiration handling
- Automatic retry logic and error recovery
- JWT token validation and claim verification
- No user interaction required - perfect for CI/CD
- Works with any Auth0 Machine-to-Machine application

#### Role-Based Testing
- Comprehensive role-based access control (RBAC) validation
- Cross-role workflow testing (Requester → Admin)
- Privilege escalation prevention testing
- Session integrity and tampering detection
- Real-time status updates between roles

#### Security Testing
- JWT token security and validation
- API endpoint protection verification
- CORS configuration validation
- Session management edge cases
- Authentication error recovery scenarios
- Performance and scalability testing

### 6. Error Handling
- Test error scenarios thoroughly
- Verify user-friendly error messages
- Check graceful degradation

## Debugging

### Common Issues

1. **Auth0 Tests Failing**
   - Verify Auth0 credentials in `cypress.env.json`
   - Check if Auth0 domain is accessible
   - Set `SKIP_AUTH0_TESTS: true` to use mocked authentication

2. **API Connection Issues**
   - Verify `API_BASE_URL` points to correct endpoint
   - Check network connectivity to API server
   - Review API interceptors in support files

3. **Flaky Tests**
   - Increase timeout values if needed
   - Check for race conditions in async operations
   - Verify proper wait conditions

### Debug Commands
```bash
# Get Cypress info
pnpm cypress:info

# Verify Cypress installation
pnpm cypress:verify

# Run specific test file
pnpm cypress:run --spec "cypress/e2e/auth/authentication.cy.ts"

# Run with debug output
DEBUG=cypress:* pnpm cypress:run
```

## Coverage Reports

Code coverage is automatically generated when tests run:
- Reports are saved to `coverage/` directory
- Coverage data is collected via `@cypress/code-coverage`
- View reports in `coverage/lcov-report/index.html`

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          start: npm run dev
          wait-on: 'http://localhost:3000'
        env:
          CYPRESS_AUTH0_ADMIN_USERNAME: ${{ secrets.CYPRESS_AUTH0_ADMIN_USERNAME }}
          CYPRESS_AUTH0_ADMIN_PASSWORD: ${{ secrets.CYPRESS_AUTH0_ADMIN_PASSWORD }}
```

## Performance Considerations

- Tests run in parallel when possible
- Session caching reduces authentication overhead
- API mocking improves test speed and reliability
- Selective test execution for different environments

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Add appropriate data-cy attributes to UI components
3. Use custom commands for repeated operations
4. Include both happy path and error scenarios
5. Update this README with new test descriptions

## Troubleshooting

### Test Environment Setup
1. Ensure Next.js development server is running on port 3000
2. Verify all required environment variables are set
3. Check that API endpoint is accessible
4. Confirm Auth0 test users exist and have proper roles

### Common Test Failures
- **Network timeouts**: Increase timeout values in cypress.config.ts
- **Element not found**: Check data-cy attributes in components
- **Auth failures**: Verify Auth0 credentials and user permissions
- **API errors**: Check API endpoint health and mock responses

For additional help, refer to the [Cypress Documentation](https://docs.cypress.io/) or create an issue in the project repository.