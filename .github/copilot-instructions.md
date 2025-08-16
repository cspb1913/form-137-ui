# Form 137 Request Portal - GitHub Copilot Instructions

Always follow these instructions first and only fall back to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

## Project Overview

Form 137 Request Portal is a Next.js 15 application for managing student record requests with role-based access control via Auth0. It uses pnpm for package management, has comprehensive testing (Jest, Pact, Cypress), and deploys as a standalone static application.

## Essential Setup and Build Commands

### Install Dependencies
```bash
# Install pnpm globally if not available
npm install -g pnpm

# Install project dependencies 
# NEVER CANCEL: Takes 4-5 minutes. Set timeout to 10+ minutes.
pnpm install --no-frozen-lockfile
```

### Environment Configuration
Copy and configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with actual Auth0 credentials
```

Required environment variables:
- `AUTH0_SECRET` - 32+ character secret for JWT signing
- `AUTH0_BASE_URL` - Application base URL (e.g., http://localhost:3000)
- `AUTH0_ISSUER_BASE_URL` - Auth0 domain URL
- `AUTH0_CLIENT_ID` - Auth0 application client ID
- `AUTH0_CLIENT_SECRET` - Auth0 application client secret
- `AUTH0_AUDIENCE` - Auth0 API audience identifier
- `NEXT_PUBLIC_API_BASE_URL` - Backend API endpoint (e.g., http://localhost:8080)
- `NEXT_PUBLIC_FORM137_API_URL` - Production Form 137 API endpoint
- `NEXT_PUBLIC_AUTH0_AUDIENCE` - Client-side Auth0 audience

### Build and Development
```bash
# Build the application
# NEVER CANCEL: Takes 2-3 minutes. Set timeout to 10+ minutes.
pnpm build

# Start development server (starts in ~2 seconds)
pnpm dev
# Available at http://localhost:3000

# Start production server (after building)
pnpm start
# Note: For standalone builds, use: node .next/standalone/server.js
```

### Testing Commands
```bash
# Run all Jest tests 
# NEVER CANCEL: Takes 8-12 minutes. Set timeout to 20+ minutes.
pnpm test

# Run tests with watch mode
pnpm test:watch

# Run comprehensive test suite with coverage
# NEVER CANCEL: Takes 10-15 minutes. Set timeout to 25+ minutes.
node scripts/run-tests.js

# Run specific test file
pnpm test -- path/to/test.tsx

# Run tests with coverage report
pnpm test -- --coverage
```

### Linting and Code Quality
```bash
# Run ESLint (takes ~1 minute, expect some lint errors)
pnpm lint
```

### Cypress E2E Testing
```bash
# Install Cypress binary (may fail in restricted network environments)
# NEVER CANCEL: Takes 5-10 minutes. Set timeout to 15+ minutes.
npx cypress install

# Verify Cypress installation
pnpm cypress:verify

# Open Cypress Test Runner (interactive)
pnpm cypress:open

# Run all E2E tests headless  
# NEVER CANCEL: Takes 10-20 minutes. Set timeout to 30+ minutes.
pnpm cypress:run

# Run E2E tests with dev server
# NEVER CANCEL: Takes 15-25 minutes. Set timeout to 35+ minutes.
pnpm test:e2e

# Interactive E2E tests with dev server
pnpm test:e2e:open
```

## Validation Scenarios

Always manually validate changes by running through these scenarios:

### Basic Application Validation
1. **Start development server**: `pnpm dev`
2. **Verify homepage loads**: Navigate to http://localhost:3000
   - Should show "Form 137 Portal" header with loading spinner
3. **Test navigation**: Go to http://localhost:3000/request
   - Should show "Verifying security..." message
4. **Verify build works**: Run `pnpm build` and `pnpm start`

### Authentication Flow Testing
1. **Test with valid Auth0 config**: 
   - Set proper environment variables in `.env.local`
   - Test login/logout flows via Auth0
   - Verify role-based routing (Admin/Requester)
2. **Test without Auth0 config**:
   - Application should start but show Auth0 warnings
   - Pages should load with authentication prompts

### Test Suite Validation
1. **Run Jest tests**: `pnpm test` (expect some failures in dev environment)
2. **Run custom test runner**: `node scripts/run-tests.js`
3. **Check test coverage**: Look for coverage reports in `coverage/` directory

## Architecture and Key Directories

### App Structure (Next.js 15 App Router)
- `/app/` - Next.js app router pages and layouts
  - `/app/api/auth/` - Auth0 authentication endpoints
  - `/app/admin/` - Admin-only pages (middleware protected)
  - `/app/requester/` - Requester-only pages (middleware protected)
- `/components/` - Reusable React components
  - `/components/ui/` - Radix UI-based component library
- `/services/` - API service layer (DashboardAPI, FormAPI)
- `/lib/` - Utility functions and shared logic
- `/hooks/` - Custom React hooks for data fetching
- `/middleware.ts` - Route protection based on user roles

### Testing Structure
- `/__tests__/` - Jest unit and integration tests
- `/__tests__/pact/` - Pact contract tests for API integration
- `/cypress/` - Cypress E2E tests with comprehensive coverage
- `/cypress/fixtures/` - Test data fixtures
- `/cypress/support/` - Custom commands and utilities

### Configuration Files
- `package.json` - Dependencies and npm scripts
- `next.config.mjs` - Next.js configuration (standalone output)
- `tailwind.config.js` - Tailwind CSS configuration
- `jest.config.js` - Jest testing configuration
- `cypress.config.ts` - Cypress E2E testing configuration

## Common Development Patterns

### When Adding New Features
1. **Follow existing service layer patterns** for API calls
2. **Use SWR hooks for data fetching** (see examples in `/hooks/`)
3. **Add comprehensive tests** for new components and API integrations
4. **Write Cypress E2E tests** for new user workflows
5. **Ensure TypeScript types are properly defined**
6. **Maintain role-based access control consistency**
7. **Always run `pnpm lint` before committing**

### Authentication Patterns
- Use `useUser()` hook from Auth0 for user context
- Implement loading states with skeleton components
- Handle errors with toast notifications
- Follow existing Radix UI component patterns in `/components/ui/`

### API Integration
```typescript
// Services use fetch with Auth0 tokens
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Known Issues and Workarounds

### Dependency Installation
- **Issue**: Lockfile may be outdated
- **Solution**: Use `pnpm install --no-frozen-lockfile`

### Cypress Binary Installation
- **Issue**: `pnpm cypress:verify` fails with network restrictions
- **Solution**: Run `npx cypress install` manually or skip Cypress tests in restricted environments
- **Fallback**: Use Jest and Pact tests for validation

### Auth0 Configuration
- **Issue**: Application shows Auth0 warnings without proper environment variables
- **Expected**: Application still builds and runs with placeholder values
- **Solution**: Set actual Auth0 credentials in `.env.local` for full functionality

### Test Failures
- **Expected**: Some Jest tests fail in development environments due to missing API endpoints
- **Normal**: Pact contract tests may fail without proper backend setup
- **Action**: Focus on tests that pass and validate core component functionality

### Linting Errors
- **Expected**: ESLint shows warnings for unused variables and TypeScript 'any' types
- **Impact**: Does not prevent builds or deployments
- **Action**: Fix critical errors, warnings can be addressed incrementally

## Build and Deployment

### Static Export
- Application builds as standalone static files
- Use `next build` for production builds
- Deployment via Docker with Nginx serving static files
- API routes handled client-side with Auth0 SDK

### Performance Expectations
- **Dependency Install**: 4-5 minutes
- **Production Build**: 2-3 minutes  
- **Test Suite**: 8-12 minutes (Jest), 10-20 minutes (Cypress)
- **Development Server**: 2 seconds to start
- **Linting**: 1 minute

### Docker Deployment
```bash
# Build Docker image (if needed)
docker build -t form137-ui .

# Run with docker-compose
docker-compose up
```

## Frequently Referenced Files

### Core Application Files
- `middleware.ts` - Route protection and role-based access
- `app/layout.tsx` - Root layout with Auth0 provider
- `components/request-form-137.tsx` - Main form component
- `components/dashboard.tsx` - Admin dashboard component
- `services/dashboard-api.ts` - Dashboard API service
- `services/form-api.ts` - Form submission API service

### Configuration and Setup
- `package.json` - Dependencies and scripts
- `next.config.mjs` - Next.js build configuration  
- `.env.local` - Environment variables (create from .env.example)
- `tailwind.config.js` - Styling configuration
- `jest.config.js` - Test configuration

### Testing Files
- `__tests__/request-form-137.test.tsx` - Form component tests
- `__tests__/dashboard.test.tsx` - Dashboard component tests
- `__tests__/pact/` - API contract tests
- `cypress/e2e/` - End-to-end test suites
- `scripts/run-tests.js` - Custom test runner with coverage

Always build and exercise your changes by running the development server and testing core user workflows before considering work complete.