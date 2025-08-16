# Development Mode Setup Guide

This guide explains how to set up and use the development mode for the Form 137 application, which bypasses Auth0 authentication for local development convenience.

## Overview

The development mode provides two main approaches for local development:

1. **Complete Auth Bypass (Recommended)**: Disables authentication entirely on both frontend and backend
2. **Mock JWT Mode**: Uses fake JWT tokens that the backend can validate for testing authentication flows

## Quick Start

### 1. Environment Configuration

Copy the example environment file and configure for development:

```bash
cp .env.development.example .env.local
```

Edit `.env.local` to enable development mode:

```env
# Set to 'true' to bypass Auth0 authentication
NEXT_PUBLIC_DEV_MODE=true

# Configure the mock user for development
NEXT_PUBLIC_DEV_USER_EMAIL=dev@example.com
NEXT_PUBLIC_DEV_USER_NAME=Development User
NEXT_PUBLIC_DEV_USER_ROLE=Admin  # Options: Admin, Requester
```

### 2. Backend Configuration

The backend has two development profiles:

#### Option A: Complete Auth Bypass (Default)
Use the standard `dev` profile with authentication disabled:

```yaml
# application-dev.yml
auth:
  enabled: false  # Disables all authentication
```

#### Option B: Mock JWT Validation
Use the `dev-with-mock-auth` profile to test JWT flows with fake tokens:

```yaml
# application-dev-with-mock-auth.yml
auth:
  enabled: true
  dev-mode: true  # Enables development JWT decoder
```

### 3. Start the Applications

Start both applications:

```bash
# Backend (choose one profile)
cd form137-api
./gradlew bootRun --args='--spring.profiles.active=dev'
# OR for JWT testing:
./gradlew bootRun --args='--spring.profiles.active=dev-with-mock-auth'

# Frontend
cd form-137-ui
npm run dev
```

## Development Features

### 1. Development User Selector

When `NEXT_PUBLIC_DEV_MODE=true`, a floating development panel appears in the bottom-right corner of the application. This panel allows you to:

- View current user information
- Switch between different user profiles (Admin, Requester, Student)
- Logout and re-login with different roles
- See development mode status

### 2. Predefined User Profiles

The system includes three predefined user profiles for testing:

```typescript
// Admin User
{
  email: "admin@example.com",
  name: "Admin User",
  role: "Admin"
}

// Requester User
{
  email: "requester@example.com", 
  name: "Requester User",
  role: "Requester"
}

// Student User
{
  email: "student@example.com",
  name: "Student User", 
  role: "Requester"
}
```

### 3. Mock JWT Tokens

When using mock JWT mode, the system generates realistic JWT tokens with:

- Standard JWT structure (header.payload.signature)
- Auth0-compatible claims
- Role-based permissions
- Configurable expiration times
- Base64URL encoding

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_DEV_MODE` | `false` | Enables/disables development mode |
| `NEXT_PUBLIC_DEV_USER_EMAIL` | `dev@example.com` | Default user email |
| `NEXT_PUBLIC_DEV_USER_NAME` | `Development User` | Default user name |
| `NEXT_PUBLIC_DEV_USER_ROLE` | `Requester` | Default user role (Admin/Requester) |

### Backend Profiles

| Profile | Auth Enabled | JWT Validation | Use Case |
|---------|--------------|---------------|----------|
| `dev` | `false` | None | Complete bypass for rapid development |
| `dev-with-mock-auth` | `true` | Mock decoder | Testing auth flows with fake tokens |
| `prod` | `true` | Real Auth0 | Production authentication |

## Security Considerations

### ⚠️ Important Security Notes

1. **Never deploy with DEV_MODE=true to production**
2. **Mock JWT tokens are NOT cryptographically secure**
3. **Development mode bypasses ALL security checks**
4. **Always verify production deployment uses real Auth0**

### Safety Measures

The system includes several safety measures to prevent accidental production deployment:

1. **Environment Checks**: Development features only activate when `NEXT_PUBLIC_DEV_MODE=true`
2. **Visual Indicators**: Development mode shows prominent orange indicators
3. **Console Logging**: Clear console messages indicate which mode is active
4. **Profile Separation**: Separate configuration files for different environments

## API Integration

### Frontend HTTP Client

The `AuthenticatedHttpClient` automatically handles both modes:

```typescript
// Works in both development and production modes
const response = await httpClient.get('/api/dashboard', accessToken, true)
```

### Backend Authentication

The Spring Boot backend automatically configures based on the profile:

```java
// Development mode - bypasses authentication
@GetMapping("/protected")
public ResponseEntity<String> protectedEndpoint() {
    // This endpoint is accessible without authentication in dev mode
    return ResponseEntity.ok("Success");
}
```

## Troubleshooting

### Common Issues

#### 1. Development Mode Not Working
- Verify `NEXT_PUBLIC_DEV_MODE=true` in `.env.local`
- Check browser console for mode indicators
- Restart the Next.js dev server after changing environment variables

#### 2. Backend Still Requiring Authentication
- Verify using the correct Spring profile (`dev` or `dev-with-mock-auth`)
- Check `auth.enabled` setting in the active profile
- Look for authentication logs in backend console

#### 3. Role-Based Access Not Working
- Verify the user role is set correctly in the development user selector
- Check that the backend endpoints have correct role requirements
- Ensure the mock JWT includes the expected role claims

#### 4. API Calls Failing
- Check network tab in browser dev tools
- Verify backend is running on http://localhost:8080
- Ensure CORS is configured correctly for localhost:3000

### Debug Information

Enable debug logging by checking the browser console for messages like:

```
🔧 Development Mode: Auth0 authentication bypassed
🔧 Development Mode: Using development JWT decoder
🚫 Authentication disabled - all endpoints are public
```

## Migration to Production

### Steps to Switch to Production Mode

1. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_DEV_MODE=false
   # Add real Auth0 configuration
   AUTH0_CLIENT_ID=your_real_client_id
   AUTH0_CLIENT_SECRET=your_real_client_secret
   # ... other Auth0 settings
   ```

2. **Backend Profile**:
   ```bash
   ./gradlew bootRun --args='--spring.profiles.active=prod'
   ```

3. **Verify Authentication**:
   - Test login flow with real Auth0
   - Verify protected routes require authentication
   - Check that development features are hidden

### Deployment Checklist

- [ ] `NEXT_PUBLIC_DEV_MODE=false` or not set
- [ ] Real Auth0 credentials configured
- [ ] Backend using `prod` profile
- [ ] Development user selector not visible
- [ ] Authentication required for protected routes
- [ ] No development console messages in production

## Best Practices

### For Developers

1. **Always use development mode for local development**
2. **Test with different user roles using the profile selector**
3. **Occasionally test with real Auth0 to ensure compatibility**
4. **Never commit `.env.local` with real secrets**

### For Teams

1. **Document which profile to use for different scenarios**
2. **Share the `.env.development.example` file with team members**
3. **Use consistent development user roles across the team**
4. **Test authentication flows before major releases**

## Architecture Details

### Frontend Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   AuthProvider  │    │  Real Auth0      │
│                 │────│  UserProvider    │
│  (Smart Switch) │    └──────────────────┘
│                 │    ┌──────────────────┐
│                 │────│  Development     │
└─────────────────┘    │  DevAuth0Provider│
                       └──────────────────┘
```

### Backend Architecture

```
┌─────────────────┐    ┌──────────────────┐
│  SecurityConfig │    │  Real Auth0      │
│                 │────│  JWT Validation  │
│  (Profile-based)│    └──────────────────┘
│                 │    ┌──────────────────┐
│                 │────│  Development     │
└─────────────────┘    │  JWT Decoder     │
                       └──────────────────┘
```

This setup provides a seamless development experience while maintaining production security standards.