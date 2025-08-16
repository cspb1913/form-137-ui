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

# Auth0 Integration Tests
pnpm cypress:run:headless --spec "cypress/e2e/auth-backend-integration.cy.ts"    # Test Auth0 backend integration
pnpm cypress:run:headless --spec "cypress/e2e/basic-smoke.cy.ts"                # Basic app functionality
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
The application uses a standardized Auth0 authentication pattern across all API services:

```typescript
// Centralized HTTP client with Auth0 integration
import { AuthenticatedHttpClient } from '@/lib/auth-http-client'

// Service layer with standardized auth handling
class ApiService {
  private httpClient = new AuthenticatedHttpClient()
  
  async getData(accessToken?: string) {
    return this.httpClient.get<ResponseType>('/api/endpoint', accessToken, true)
  }
}

// Component pattern with token retrieval
import { useGetAuth0Token } from '@/hooks/use-auth0-token'

export function Component() {
  const getToken = useGetAuth0Token()
  
  const handleApiCall = async () => {
    const token = await getToken()
    await apiService.getData(token)
  }
}
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

### Auth0 Configuration (Required)
Create `.env.local` with the following variables:

```bash
# Auth0 Configuration
AUTH0_CLIENT_ID=qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC
AUTH0_CLIENT_SECRET=OSUSqi319Jj3ek80o0Rv7ILqriTaTUcZqS2vwtJDQ_-OlgpT1RiRBx8iAWJfahlN
AUTH0_ISSUER_BASE_URL=https://jasoncalalang.auth0.com
AUTH0_DOMAIN=jasoncalalang.auth0.com
AUTH0_AUDIENCE=https://form137.cspb.edu.ph/api
AUTH0_BASE_URL=http://localhost:3000
APP_BASE_URL=http://localhost:3000
AUTH0_SECRET=a_very_long_secret_value_with_at_least_32_characters_for_jwt_signing_purposes

# Public Auth0 Configuration (exposed to client)
NEXT_PUBLIC_AUTH0_AUDIENCE=https://form137.cspb.edu.ph/api

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_FORM137_API_URL=http://localhost:8080
```

### Cypress Testing Configuration
Create `cypress.env.json` for E2E testing:

```json
{
  "API_BASE_URL": "http://localhost:8080",
  "AUTH0_DOMAIN": "jasoncalalang.auth0.com",
  "AUTH0_CLIENT_ID": "qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC",
  "AUTH0_AUDIENCE": "https://form137.cspb.edu.ph/api",
  "AUTH0_SCOPE": "openid profile email",
  "AUTH0_REQUESTER_USERNAME": "testuser@cspb.edu.ph",
  "AUTH0_REQUESTER_PASSWORD": "2025@CSPB",
  "SKIP_AUTH0_TESTS": false
}
```

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

## Auth0 Testing and Verification

### Manual Auth0 Testing
For manual testing of the Auth0 requester flow:

1. **Start both services**:
   ```bash
   # Terminal 1: Start backend API
   cd /path/to/form137-api && ./gradlew bootRunDev
   
   # Terminal 2: Start frontend
   cd /path/to/form-137-ui && pnpm dev
   ```

2. **Test Auth0 Integration**:
   - Visit: http://localhost:3000/auth-test.html
   - Click: "🔑 Login with Auth0"
   - Login with: `testuser@cspb.edu.ph` / `2025@CSPB`
   - After login: Click "👤 Get User Info" to verify authentication
   - Test API: Click "🌐 Test API Call" to verify backend integration

### Automated Testing Status
- ✅ **Basic smoke tests**: Passing (3/3)
- ✅ **Backend security tests**: Passing - verifies API endpoints are properly secured
- ✅ **Auth0 redirect tests**: Passing - confirms login redirects to Auth0
- ⚠️ **Full Auth0 login automation**: Requires manual completion due to Auth0 security

### API Integration Verification
The frontend automatically sends JWT tokens to backend endpoints:

```typescript
// Service classes automatically handle auth headers
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Troubleshooting Auth0 Issues
- **403 errors**: Ensure both frontend and backend are running with matching Auth0 configuration
- **CORS errors**: Verify `cors.allowed-origins` includes `http://localhost:3000` in API
- **Token validation**: Check that `AUTH0_AUDIENCE` matches between frontend and backend
- **Redirect issues**: Verify `AUTH0_BASE_URL` and `APP_BASE_URL` are correctly set

## Auth0 Authentication Infrastructure

### Centralized Authentication System
The application has been standardized to use a unified Auth0 authentication pattern across all components and services.

#### Core Infrastructure Files
- **`/lib/auth-http-client.ts`**: Centralized HTTP client with automatic Auth0 token handling
- **`/hooks/use-auth0-token.ts`**: Standardized hooks for Auth0 token retrieval
- **`/docs/AUTH0_AUTHENTICATION_PATTERN.md`**: Comprehensive documentation and guidelines

#### Authentication Flow Architecture
```
Component → useGetAuth0Token() → getAuth0Token() → AuthenticatedHttpClient → API
```

### Standardized API Service Pattern
All API services now follow this consistent pattern:

```typescript
// Service Layer
class ApiService {
  private httpClient = new AuthenticatedHttpClient()
  
  // Required authentication
  async getProtectedData(accessToken: string) {
    return this.httpClient.get<DataType>('/api/protected', accessToken, true)
  }
  
  // Optional authentication  
  async getPublicData(accessToken?: string) {
    return this.httpClient.get<DataType>('/api/public', accessToken, false)
  }
}
```

### Component Integration Pattern
All components use standardized Auth0 hooks:

```typescript
import { useUser } from '@auth0/nextjs-auth0/client'
import { useGetAuth0Token } from '@/hooks/use-auth0-token'

export function Component() {
  const { user } = useUser()
  const getToken = useGetAuth0Token()
  
  const handleApiCall = async () => {
    const token = await getToken()
    // Automatic error handling and loading states
    await apiService.callMethod(token)
  }
}
```

### Key Benefits
- **Consistency**: All API calls follow the same authentication pattern
- **Security**: Centralized token handling with proper error management  
- **Maintainability**: Single source of truth for authentication logic
- **Type Safety**: Full TypeScript support with proper typing
- **Error Handling**: Standardized error messages and user feedback

### Migration from Legacy Pattern
Components and services have been updated from manual token handling:

```typescript
// Before (manual)
const { getAccessToken } = useAccessToken()
const token = await getAccessToken({ audience: '...' })
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
})

// After (standardized)
const getToken = useGetAuth0Token()
const token = await getToken()
const data = await apiService.getData(token)
```

This ensures all protected API endpoints receive proper bearer tokens and maintain secure communication with the backend API.