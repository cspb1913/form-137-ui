# Development Mode Testing Guide

This guide explains how to use the enhanced Cypress testing setup that supports different test suites for development mode vs production mode.

## Overview

The Cypress test suite now supports two distinct modes:

- **Development Mode**: Fast, focused tests using mocked authentication and local APIs
- **Production Mode**: Comprehensive tests using real Auth0 and full API integration

## Quick Start

### Development Mode Testing

For rapid development feedback with mocked authentication:

```bash
# Run all dev tests
npm run test:e2e:dev

# Run dev tests with Cypress GUI
npm run test:e2e:dev:open

# Run specific dev test categories
./cypress/scripts/run-enhanced-tests.sh dev dev
./cypress/scripts/run-enhanced-tests.sh api dev
./cypress/scripts/run-enhanced-tests.sh smoke dev
```

### Production Mode Testing

For comprehensive testing with real Auth0:

```bash
# Run all production tests
npm run test:e2e:prod

# Run specific production test categories
./cypress/scripts/run-enhanced-tests.sh security prod
./cypress/scripts/run-enhanced-tests.sh all prod
```

## Configuration

### Environment Detection

The system automatically detects dev mode through:

1. `NEXT_PUBLIC_DEV_MODE=true` environment variable
2. `CYPRESS_DEV_MODE=true` environment variable
3. Auto-detection from `.env.local` file

### Manual Mode Selection

You can force a specific mode:

```bash
# Force development mode
export NEXT_PUBLIC_DEV_MODE=true
export CYPRESS_DEV_MODE=true

# Force production mode
export NEXT_PUBLIC_DEV_MODE=false
export CYPRESS_DEV_MODE=false
```

## Test Categories

### Development Mode Tests

Located in `cypress/e2e/dev/`:

#### 1. Development Mode Functionality (`dev-mode-functionality.cy.ts`)
- Dev mode detection and indicators
- Mock authentication flow
- User role simulation
- Development workflow features
- Performance validation

#### 2. Development Authentication Simulation (`dev-auth-simulation.cy.ts`)
- Mock user management
- Role-based access testing
- Authentication state management
- Development token simulation
- Error simulation

#### 3. Development API Testing (`dev-api-testing.cy.ts`)
- Local API connectivity
- Mock API responses
- Error handling
- Performance testing
- Development utilities

### Production Mode Tests

Located in `cypress/e2e/` (excluding `dev/` directory):

- **Security Tests**: Auth0 security validation, JWT token security
- **RBAC Tests**: Role-based access control, privilege escalation prevention
- **API Integration**: Real API endpoints, full authentication flow
- **Lifecycle Tests**: Complete Form 137 workflow testing
- **Authentication**: Real Auth0 integration testing

## Development Workflow

### 1. Starting Development

```bash
# Start the development servers
cd /root/git/form137-api && ./gradlew bootRunDev &
cd /root/git/form-137-ui && pnpm dev &

# Run dev mode tests
npm run test:e2e:dev:open
```

### 2. Rapid Testing During Development

```bash
# Quick smoke tests
./cypress/scripts/run-enhanced-tests.sh smoke dev

# Test specific functionality
./cypress/scripts/run-enhanced-tests.sh dev dev

# Test API integration with local backend
./cypress/scripts/run-enhanced-tests.sh api dev
```

### 3. Pre-commit Testing

```bash
# Run all dev tests before committing
./cypress/scripts/run-enhanced-tests.sh all dev
```

### 4. CI/CD Pipeline Testing

```bash
# Run full production test suite
./cypress/scripts/run-enhanced-tests.sh all prod
```

## NPM Scripts Reference

### Development Mode Scripts

```bash
npm run cypress:dev              # Run dev tests headless
npm run cypress:dev:open         # Open Cypress GUI in dev mode
npm run cypress:dev:config       # Use dedicated dev config file
npm run test:e2e:dev             # Start server and run dev tests
npm run test:e2e:dev:open        # Start server and open dev GUI
npm run test:e2e:dev:config      # Start server and use dev config
```

### Production Mode Scripts

```bash
npm run cypress:prod             # Run production tests headless
npm run test:e2e:prod            # Start production server and run tests
npm run test:e2e:ci              # CI-optimized production tests
```

### Legacy Scripts (auto-detect mode)

```bash
npm run cypress:run              # Auto-detect mode
npm run test:e2e                 # Auto-detect mode with server
```

## Configuration Files

### Main Configuration (`cypress.config.ts`)
- Dynamic spec pattern selection based on environment
- Environment-specific settings
- Auto-detection of dev/prod mode

### Development Configuration (`cypress.dev.config.ts`)
- Optimized for development workflow
- Shorter timeouts for faster feedback
- Dev-focused spec patterns
- Local API endpoints

### Environment Configuration (`cypress.env.json`)
- Shared environment variables
- Auth0 credentials
- API endpoints

## Mock Authentication in Dev Mode

### Setting Up Mock Users

```javascript
// In development tests, set up mock users:
cy.window().then((win) => {
  win.localStorage.setItem('dev-user-email', 'admin@example.com')
  win.localStorage.setItem('dev-user-name', 'Test Admin')
  win.localStorage.setItem('dev-user-role', 'Admin')
})
```

### Available Mock Roles

- `Admin`: Full access to all features
- `Requester`: Can submit and view own requests
- `''` (empty): No specific roles, unauthorized access

### Switching Users During Testing

```javascript
// Switch to requester
cy.window().then((win) => {
  win.localStorage.setItem('dev-user-role', 'Requester')
})
cy.reload()

// Switch to admin
cy.window().then((win) => {
  win.localStorage.setItem('dev-user-role', 'Admin')
})
cy.reload()
```

## API Testing in Dev Mode

### Local API Health Check

The dev tests include automatic local API health checking:

```javascript
cy.task('checkLocalApiHealth').then((result) => {
  if (result.status === 200) {
    cy.log('✅ Local API is running')
  } else {
    cy.log('⚠️ Local API not running - using mocks')
  }
})
```

### Mock API Responses

```javascript
// Mock successful API responses
cy.intercept('GET', '**/api/dashboard/**', {
  statusCode: 200,
  body: { requests: [] }
}).as('dashboardApi')
```

## Troubleshooting

### Common Issues

1. **Tests failing in dev mode**: Ensure `NEXT_PUBLIC_DEV_MODE=true` is set
2. **API connectivity issues**: Check if local backend is running
3. **Authentication issues**: Verify mock user setup in localStorage
4. **Slow tests**: Use dev mode for faster feedback during development

### Debug Commands

```bash
# Check current mode detection
export NEXT_PUBLIC_DEV_MODE=true
./cypress/scripts/run-enhanced-tests.sh --help

# Verify configuration
npm run cypress:info

# Test local API connectivity
curl http://localhost:8080/api/health/liveness
```

### Environment Verification

```bash
# Check if in dev mode
echo $NEXT_PUBLIC_DEV_MODE
echo $CYPRESS_DEV_MODE

# Verify servers are running
ps aux | grep -E "(next|gradle|bootRun)"
```

## Best Practices

### Development Testing

1. **Use dev mode during active development** for faster feedback
2. **Mock external dependencies** to avoid flaky tests
3. **Focus on UI and user interactions** rather than integration
4. **Use smoke tests** for quick validation
5. **Test role switching** to verify access controls

### Production Testing

1. **Use production mode for CI/CD** to catch integration issues
2. **Test real authentication flows** to verify Auth0 setup
3. **Validate API security** and authorization
4. **Run comprehensive test suites** before releases
5. **Monitor test performance** and optimize as needed

### Hybrid Approach

1. **Start with dev mode** during feature development
2. **Switch to production mode** for integration testing
3. **Use smoke tests** for quick validation in both modes
4. **Run full test suite** before merging to main branch

## Integration with Development Workflow

### Git Hooks

```bash
# Pre-commit: Run dev tests
./cypress/scripts/run-enhanced-tests.sh smoke dev

# Pre-push: Run production tests
./cypress/scripts/run-enhanced-tests.sh all prod
```

### IDE Integration

Most IDEs can run the npm scripts directly:
- `test:e2e:dev:open` for visual development
- `test:e2e:dev` for headless development testing

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run Development Tests
  run: npm run test:e2e:dev
  
- name: Run Production Tests
  run: npm run test:e2e:prod
```

This dual-mode testing approach provides the flexibility to have fast development feedback while maintaining comprehensive production-level testing when needed.