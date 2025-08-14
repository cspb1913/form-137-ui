# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Form 137 Request Portal - A Next.js 15 application for managing student record requests with role-based access control via Auth0.

## Essential Commands

### Development
```bash
pnpm dev          # Start development server on port 3000
pnpm build        # Create production build
pnpm start        # Run production server
pnpm lint         # Run ESLint
pnpm test         # Run Jest test suite
pnpm test:watch   # Run tests in watch mode
node scripts/run-tests.js  # Run full test suite with coverage
```

### Testing Specific Files
```bash
pnpm test -- path/to/test.tsx              # Run specific test file
pnpm test -- --coverage                    # Run with coverage report
pnpm test -- --updateSnapshot              # Update snapshots
```

### Cypress E2E Testing
```bash
pnpm cypress:open                           # Open Cypress Test Runner (interactive)
pnpm cypress:run                            # Run all E2E tests headless
pnpm cypress:run:chrome                     # Run tests with Chrome browser
pnpm cypress:run:firefox                    # Run tests with Firefox browser
pnpm test:e2e                               # Run E2E tests with dev server
pnpm test:e2e:open                          # Interactive E2E tests with dev server
pnpm cypress:verify                         # Verify Cypress installation
pnpm cypress:info                           # Get Cypress system info
```

## Architecture Overview

### App Structure
- **Next.js 15 App Router** with static export deployment
- **Auth0 Integration** for authentication with role-based routing (Admin/Requester)
- **Service Layer Pattern** with `DashboardAPI` and `FormAPI` classes in `/services/`
- **SWR** for data fetching and caching with custom hooks
- **Radix UI + Tailwind CSS** for component library

### Key Directories
- `/app/` - Next.js app router pages and layouts
  - `/app/api/auth/` - Auth0 authentication endpoints
  - `/app/admin/` - Admin-only pages (middleware protected)
  - `/app/requester/` - Requester-only pages (middleware protected)
- `/components/` - Reusable React components
  - `/components/ui/` - Radix UI-based component library
- `/services/` - API service layer (DashboardAPI, FormAPI)
- `/lib/` - Utility functions and shared logic
- `/hooks/` - Custom React hooks for data fetching

### Authentication Flow
1. Auth0 handles authentication via `/api/auth/[auth0]` dynamic route
2. Middleware (`middleware.ts`) protects routes based on user roles
3. Roles are extracted from JWT token claims
4. Users are automatically redirected based on their role

### API Integration Pattern
```typescript
// Services use fetch with Auth0 tokens
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Testing Strategy
- **Unit Tests**: Components and utilities with React Testing Library
- **Pact Contract Tests**: API integration contracts in `__tests__/pact/`
- **E2E Tests**: Cypress tests for complete user workflows and integration
- **Auth0 Mocking**: Mock authentication for testing protected routes
- **Coverage Target**: Maintain high test coverage across critical paths

### Cypress Testing Framework
- **Location**: `/cypress/` directory with comprehensive test suites
- **Coverage**: Authentication flows, role-based routing, form workflows, admin functions, security
- **Configuration**: `cypress.config.ts` with API endpoint and Auth0 integration
- **Mock Data**: Test fixtures in `/cypress/fixtures/` for consistent test data
- **Custom Commands**: Authentication helpers and form utilities in `/cypress/support/`
- **Success Rate**: 71% test coverage with working smoke tests and critical path validation

## Environment Configuration

Key environment variables required:
- `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
- `AUTH0_AUDIENCE` - API audience for token validation
- `APP_BASE_URL` - Application base URL for Auth0 client configuration (e.g., 'http://localhost:3000')
- `NEXT_PUBLIC_API_BASE_URL` - Local backend API endpoint (usually 'http://localhost:8080')
- `NEXT_PUBLIC_FORM137_API_URL` - Production Form 137 API endpoint
- `NEXT_PUBLIC_AUTH0_REDIRECT_URI` - Post-login redirect
- `NEXT_PUBLIC_AUTH0_AUDIENCE` - Client-side Auth0 audience

## Important Implementation Details

### Role-Based Access Control
- Admin role: Access to dashboard and form management
- Requester role: Access to personal requests only
- Roles determined from Auth0 token claims at `${AUTH0_BASE_URL}/roles`

### Static Export Deployment
- Built as static HTML/CSS/JS (`next.config.js` has `output: 'export'`)
- Deployed via Docker with Nginx serving static files
- API routes handled client-side with Auth0 SDK

### Theme Configuration
- Forced light mode (dark mode disabled in `app/globals.css`)
- Custom color scheme: Green primary, yellow accents
- Consistent spacing and typography using Tailwind

### Form Handling
- Multi-step forms for request creation
- File upload support for supporting documents
- Form validation using React Hook Form patterns

## Development Guidelines

### When Adding New Features
1. Follow existing service layer patterns for API calls
2. Use SWR hooks for data fetching (see existing examples in `/hooks/`)
3. Add comprehensive tests for new components and API integrations
4. Write Cypress E2E tests for new user workflows and critical paths
5. Ensure TypeScript types are properly defined
6. Maintain role-based access control consistency
7. Run `pnpm cypress:run` to verify E2E tests still pass

### Common Patterns
- Use `useUser()` hook from Auth0 for user context
- Implement loading states with skeleton components
- Handle errors with toast notifications
- Follow existing Radix UI component patterns in `/components/ui/`