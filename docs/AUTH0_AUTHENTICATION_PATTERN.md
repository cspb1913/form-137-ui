# Auth0 Authentication Pattern Guide

## Overview

This document outlines the standardized Auth0 authentication pattern implemented across the form-137-ui application. All API services and components follow this consistent approach to ensure secure and maintainable authentication.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Components    │    │   Auth0 Hooks    │    │   HTTP Client       │
│                 │    │                  │    │                     │
│ Dashboard       │───▶│ useGetAuth0Token │───▶│ AuthenticatedHttp   │
│ RequestDetail   │    │ useAuth0Token    │    │ Client              │
│ AdminDetail     │    │                  │    │                     │
│ etc.            │    │                  │    │                     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │                         │
                                ▼                         ▼
                       ┌──────────────────┐    ┌─────────────────────┐
                       │ @auth0/nextjs    │    │   API Services      │
                       │ getAccessToken   │    │                     │
                       │                  │    │ DashboardAPI        │
                       │                  │    │ FormApiService      │
                       └──────────────────┘    └─────────────────────┘
```

## Core Components

### 1. AuthenticatedHttpClient (`/lib/auth-http-client.ts`)

Central HTTP client that handles Auth0 bearer token authentication consistently across all API calls.

**Key Features:**
- Automatic Authorization header management
- Support for both required and optional authentication
- Consistent error handling
- Standardized request/response processing

**Usage:**
```typescript
import { AuthenticatedHttpClient } from '@/lib/auth-http-client'

const client = new AuthenticatedHttpClient({
  baseUrl: process.env.NEXT_PUBLIC_FORM137_API_URL
})

// Required authentication
const data = await client.get<ResponseType>('/api/endpoint', accessToken, true)

// Optional authentication
const data = await client.post<ResponseType>('/api/endpoint', payload, accessToken, false)
```

### 2. Auth0 Token Hooks (`/hooks/use-auth0-token.ts`)

Standardized hooks for Auth0 token retrieval with proper error handling.

**useGetAuth0Token:**
- Simple hook for one-time token retrieval
- Handles audience configuration automatically
- Consistent error handling

**useAuth0Token:**
- Advanced hook with loading states and error management
- Suitable for complex authentication flows

**Usage:**
```typescript
import { useGetAuth0Token } from '@/hooks/use-auth0-token'

function MyComponent() {
  const getToken = useGetAuth0Token()
  
  const handleApiCall = async () => {
    try {
      const token = await getToken()
      // Use token for API calls
    } catch (error) {
      // Handle authentication error
    }
  }
}
```

## Service Implementation Patterns

### Pattern 1: Required Authentication (Dashboard API)

Used for admin/protected endpoints that always require authentication.

```typescript
export class DashboardAPI {
  private httpClient: AuthenticatedHttpClient

  async getDashboardData(token: string): Promise<DashboardResponse> {
    return this.httpClient.get<DashboardResponse>('/api/dashboard/requests', token, true)
  }
}
```

### Pattern 2: Optional Authentication (Form API)

Used for public endpoints that can benefit from authentication but don't require it.

```typescript
export class FormApiService {
  private httpClient: AuthenticatedHttpClient

  async submitForm(formData: FormData, accessToken?: string): Promise<SubmissionResponse> {
    return this.httpClient.post<SubmissionResponse>('/api/form137/submit', formData, accessToken, false)
  }
}
```

## Component Implementation Pattern

All components follow this standardized pattern:

```typescript
import { useUser } from '@auth0/nextjs-auth0/client'
import { useGetAuth0Token } from '@/hooks/use-auth0-token'
import { apiService } from '@/services/api-service'

export function MyComponent() {
  const { user } = useUser()
  const getToken = useGetAuth0Token()

  const handleApiCall = async () => {
    if (!user) return

    try {
      const token = await getToken()
      const response = await apiService.someMethod(data, token)
      // Handle response
    } catch (error) {
      console.error('API call failed:', error)
      // Handle error (show toast, etc.)
    }
  }

  return (
    // Component JSX
  )
}
```

## Migration Guide

### For Existing Services

1. **Import the AuthenticatedHttpClient:**
   ```typescript
   import { AuthenticatedHttpClient } from '@/lib/auth-http-client'
   ```

2. **Replace fetch calls with HTTP client:**
   ```typescript
   // Before
   const response = await fetch(url, {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     method: 'POST',
     body: JSON.stringify(data)
   })

   // After
   const response = await this.httpClient.post<ResponseType>(endpoint, data, token, true)
   ```

### For Existing Components

1. **Update imports:**
   ```typescript
   // Before
   import { useUser, getAccessToken } from '@auth0/nextjs-auth0'

   // After
   import { useUser } from '@auth0/nextjs-auth0/client'
   import { useGetAuth0Token } from '@/hooks/use-auth0-token'
   ```

2. **Update token retrieval:**
   ```typescript
   // Before
   const token = await getAccessToken({
     audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
   })

   // After
   const getToken = useGetAuth0Token()
   const token = await getToken()
   ```

## Security Best Practices

### 1. Token Handling
- Never store tokens in localStorage or sessionStorage
- Use Auth0's built-in token management
- Always validate token audience
- Handle token expiration gracefully

### 2. Error Handling
- Provide user-friendly error messages
- Log detailed errors for debugging
- Implement proper fallback for authentication failures
- Don't expose sensitive authentication details

### 3. HTTPS Only
- All API calls must use HTTPS in production
- Configure proper CORS headers
- Validate SSL certificates

### 4. Scope-Based Authorization
- Request only necessary scopes
- Validate scopes on the backend
- Implement role-based access control (RBAC)

## Environment Configuration

Ensure these environment variables are properly configured:

```bash
# Auth0 Configuration
NEXT_PUBLIC_AUTH0_AUDIENCE=your-api-audience
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=https://your-domain.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# API Configuration
NEXT_PUBLIC_FORM137_API_URL=https://your-api-domain.com
```

## Testing Considerations

### 1. Mock Auth0 Hooks
```typescript
// In test files
jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({ user: mockUser, isLoading: false }),
  getAccessToken: jest.fn().mockResolvedValue('mock-token')
}))
```

### 2. Mock HTTP Client
```typescript
jest.mock('@/lib/auth-http-client', () => ({
  AuthenticatedHttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }))
}))
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - Verify token is being retrieved correctly
   - Check audience configuration
   - Ensure user is properly authenticated

2. **CORS Errors**
   - Verify API server CORS configuration
   - Check Origin headers
   - Ensure proper preflight handling

3. **Token Expiration**
   - Implement proper token refresh logic
   - Handle 401 responses gracefully
   - Redirect to login when necessary

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=auth0:*
```

This will provide detailed Auth0 authentication flow logs.

## Compliance and Standards

This authentication pattern follows:
- OAuth 2.0 Authorization Code Flow with PKCE
- Auth0 security best practices
- OWASP authentication guidelines
- React/Next.js security recommendations

## Updates and Maintenance

- Regular security audits of authentication flow
- Keep Auth0 SDK updated to latest versions
- Monitor for security advisories
- Review and update token expiration policies
- Validate environment configurations regularly