# Production Deployment Guide - Auth0 Fix

## Overview

This guide provides step-by-step instructions for deploying the Auth0 `/api/auth/me` 401 error fix to production environments with zero downtime and rollback capabilities.

## Pre-Deployment Checklist

### ✅ Code Changes Validation
- [x] Auth0 configuration updated with security best practices
- [x] Environment-specific configurations created
- [x] Role extraction logic improved for custom claims
- [x] Session management optimized
- [x] Cypress tests implemented and passing
- [x] Security validation completed

### ✅ Auth0 Dashboard Configuration
- [x] Custom Claims Action created and tested
- [x] User roles assigned in app_metadata
- [x] Action deployed to Login flow
- [x] Test user validation completed

### ✅ Environment Preparation
- [x] Production environment variables prepared
- [x] Secrets management configured
- [x] SSL certificates validated
- [x] DNS configuration verified

## Deployment Process

### Step 1: Pre-Deployment Testing

```bash
# Run full test suite
npm run test
npm run test:e2e

# Run Auth0-specific tests
npx cypress run --spec "cypress/e2e/auth/auth0-production-fix-validation.cy.ts"

# Security validation
npm audit
npm run lint
npm run build
```

### Step 2: Environment Configuration

#### Production Environment Variables

Create production `.env.production` file:

```bash
# Production Environment Configuration
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_USE_CUSTOM_AUTH=false

# API Configuration - Production
NEXT_PUBLIC_API_BASE_URL=https://form137.cspb.edu.ph
NEXT_PUBLIC_FORM137_API_URL=https://form137.cspb.edu.ph

# Auth0 Configuration - Production
AUTH0_CLIENT_ID=qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC
AUTH0_ISSUER_BASE_URL=https://jasoncalalang.auth0.com
AUTH0_DOMAIN=jasoncalalang.auth0.com
AUTH0_AUDIENCE=https://form137.cspb.edu.ph/api
AUTH0_BASE_URL=https://form137.cspb.edu.ph
APP_BASE_URL=https://form137.cspb.edu.ph

# Public Auth0 Configuration
NEXT_PUBLIC_AUTH0_AUDIENCE=https://form137.cspb.edu.ph/api
NEXT_PUBLIC_AUTH0_DOMAIN=jasoncalalang.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=qZTxWCF60uQ3qLkDHkgvVSUGTNjSMVrC

# Security Settings (Set via secure deployment system)
AUTH0_SECRET=${PRODUCTION_AUTH0_SECRET}
NEXT_PUBLIC_CSPB_API_SECRET=${PRODUCTION_CSPB_API_SECRET}
```

#### Secure Secret Management

```bash
# Generate secure AUTH0_SECRET (minimum 32 characters)
openssl rand -base64 32

# Example deployment with Vercel
vercel env add AUTH0_SECRET production
vercel env add NEXT_PUBLIC_CSPB_API_SECRET production

# Example deployment with Docker
docker run -e AUTH0_SECRET="$SECURE_SECRET" form137-ui

# Example deployment with Kubernetes
kubectl create secret generic form137-secrets \
  --from-literal=AUTH0_SECRET="$SECURE_SECRET" \
  --from-literal=CSPB_API_SECRET="$API_SECRET"
```

### Step 3: Blue-Green Deployment Strategy

#### Option A: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview environment first
vercel --env production

# Test preview deployment
curl -I https://preview-url.vercel.app/api/auth/me

# Promote to production
vercel --prod
```

#### Option B: Docker Deployment

```bash
# Build production image
docker build -t form137-ui:latest .

# Test container locally with production config
docker run -p 3000:3000 \
  --env-file .env.production \
  form137-ui:latest

# Deploy to production
docker tag form137-ui:latest registry.com/form137-ui:v1.0.0
docker push registry.com/form137-ui:v1.0.0

# Rolling update
kubectl set image deployment/form137-ui \
  form137-ui=registry.com/form137-ui:v1.0.0
```

#### Option C: Traditional Server Deployment

```bash
# Build production assets
npm run build

# Test production build locally
npm start

# Deploy to production server
rsync -av --delete .next/ production-server:/app/.next/
rsync -av --delete public/ production-server:/app/public/

# Restart application with zero downtime
pm2 reload form137-ui
```

### Step 4: Database Migration (if applicable)

```bash
# No database changes required for this Auth0 fix
# User roles are managed in Auth0 app_metadata
echo "No database migrations needed for Auth0 fix"
```

### Step 5: Post-Deployment Validation

#### Automated Health Checks

```bash
#!/bin/bash
# health-check.sh

PROD_URL="https://form137.cspb.edu.ph"
TIMEOUT=30

echo "🔍 Starting post-deployment validation..."

# Check application health
echo "📡 Checking application health..."
if curl -f -s --max-time $TIMEOUT "$PROD_URL/api/health"; then
    echo "✅ Application health check passed"
else
    echo "❌ Application health check failed"
    exit 1
fi

# Check Auth0 configuration
echo "🔐 Checking Auth0 configuration..."
if curl -f -s --max-time $TIMEOUT "$PROD_URL" | grep -q "auth0"; then
    echo "✅ Auth0 configuration detected"
else
    echo "⚠️  Auth0 configuration not detected"
fi

# Check SSL certificate
echo "🔒 Checking SSL certificate..."
if curl -I -s --max-time $TIMEOUT "$PROD_URL" | grep -q "200 OK"; then
    echo "✅ SSL certificate valid"
else
    echo "❌ SSL certificate invalid"
    exit 1
fi

echo "🎉 All health checks passed!"
```

#### Manual Validation Steps

1. **Authentication Flow Test**:
   ```bash
   # Test login redirect
   curl -I https://form137.cspb.edu.ph/dashboard
   # Should return 302 redirect to Auth0
   
   # Test logout
   curl -I https://form137.cspb.edu.ph/api/auth/logout
   # Should return 302 redirect
   ```

2. **Role-Based Access Test**:
   - Login as admin user: `jason@cspb.edu.ph`
   - Verify access to `/admin` routes
   - Check user roles in `/debug-auth`
   - Verify `/api/auth/me` returns 200 with roles

3. **Performance Validation**:
   ```bash
   # Check response times
   curl -w "Total time: %{time_total}s\n" \
        -o /dev/null -s \
        https://form137.cspb.edu.ph/
   # Should be < 2 seconds
   ```

### Step 6: Monitoring Setup

#### Application Performance Monitoring

```javascript
// Monitor Auth0 performance
const authMetrics = {
  loginTime: performance.now(),
  tokenValidation: performance.now(),
  roleExtraction: performance.now()
}

// Send to monitoring service
analytics.track('auth_performance', authMetrics)
```

#### Error Monitoring

```javascript
// Monitor 401 errors specifically  
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.status === 401) {
    errorReporting.captureException(new Error('Auth 401 Error'), {
      extra: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    })
  }
})
```

#### Auth0 Dashboard Monitoring

- Set up alerts for failed login attempts
- Monitor token validation failures
- Track user registration and role assignments
- Monitor API rate limits

### Step 7: Rollback Procedures

#### Immediate Rollback (< 5 minutes)

```bash
# Vercel rollback
vercel rollback [previous-deployment-url]

# Docker rollback
kubectl rollout undo deployment/form137-ui

# Traditional server rollback
pm2 stop form137-ui
git reset --hard HEAD~1
npm run build
pm2 start form137-ui
```

#### Auth0 Configuration Rollback

```bash
# Disable Auth0 Action if needed
# Go to Auth0 Dashboard → Actions → Flows → Login
# Remove or disable the custom claims action

# Restore previous user roles
# Check user app_metadata backup
# Restore via Auth0 Management API if needed
```

### Step 8: Post-Deployment Monitoring

#### First 24 Hours Monitoring

- **Authentication Success Rate**: > 99%
- **Average Login Time**: < 2 seconds
- **401 Error Rate**: < 0.1%
- **Role Extraction Success**: 100%

#### Monitoring Dashboard

```bash
# Key metrics to monitor
- Auth0 login attempts vs successes
- /api/auth/me response times and error rates
- Role-based access control effectiveness
- Session duration and renewal patterns
- Security incidents and failed authentication attempts
```

#### Alerting Configuration

```yaml
# Example alerting rules
alerts:
  - name: "High Auth 401 Rate"
    condition: "auth_401_errors > 10 per minute"
    action: "immediate_notification"
    
  - name: "Auth0 Service Down"
    condition: "auth0_availability < 99%"
    action: "escalate_to_oncall"
    
  - name: "Role Extraction Failures"
    condition: "role_extraction_errors > 0"
    action: "check_auth0_action"
```

## Success Criteria

### ✅ Deployment Success Indicators

1. **Zero 401 errors** on `/api/auth/me` after successful login
2. **Role-based navigation** working correctly for all user types
3. **Performance maintained** - login flow < 2 seconds
4. **Security enhanced** - all security checklist items validated
5. **Monitoring active** - all dashboards showing green status

### ✅ User Experience Validation

- Users can login successfully without errors
- Admin users see admin dashboard immediately after login
- Requester users see appropriate interface
- Session management works smoothly
- No unexpected logouts or auth errors

## Emergency Contacts

- **Primary Engineer**: [Your contact]
- **Auth0 Support**: support@auth0.com (if using paid plan)
- **DevOps Team**: [DevOps contact]
- **Security Team**: [Security contact]

## Documentation Updates

After successful deployment:

1. Update API documentation with new auth flow
2. Update developer onboarding guide
3. Update security documentation
4. Add deployment to change log
5. Update monitoring runbooks

---

**Note**: This deployment guide ensures a smooth, secure, and monitored rollout of the Auth0 fix with comprehensive rollback capabilities and validation procedures.