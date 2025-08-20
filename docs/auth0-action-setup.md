# Auth0 Custom Claims Action Setup

## Required Auth0 Configuration for Role-Based Access

This document provides the complete Auth0 Action configuration required to fix the `/api/auth/me` 401 errors and enable role-based access control.

## Step 1: Create Auth0 Action

1. **Navigate to Auth0 Dashboard**:
   - Go to https://manage.auth0.com
   - Login to your `jasoncalalang.auth0.com` tenant

2. **Create New Action**:
   - Go to **Actions** → **Flows** → **Login**
   - Click **Custom** → **Build Custom**
   - Name: `Add Form137 Role Claims`
   - Trigger: `Login / Post Login`

## Step 2: Auth0 Action Code

```javascript
/**
 * Auth0 Action: Add Form137 Role Claims
 * Trigger: Login / Post Login
 * Purpose: Add custom role claims to ID and Access tokens for Form137 application
 */
exports.onExecutePostLogin = async (event, api) => {
  console.log('Form137 Role Claims Action executing for user:', event.user.email);
  
  // Define audience namespaces for different environments
  const audiences = [
    'https://form137.cspb.edu.ph/api',  // Production
    'http://localhost:8080/api'         // Development
  ];
  
  // Get user roles from app_metadata (recommended approach)
  let roles = [];
  
  // Primary: Get roles from app_metadata
  if (event.user.app_metadata && event.user.app_metadata.roles) {
    roles = event.user.app_metadata.roles;
  }
  // Fallback: Get roles from user_metadata  
  else if (event.user.user_metadata && event.user.user_metadata.roles) {
    roles = event.user.user_metadata.roles;
  }
  // Fallback: Get roles from Authorization Extension (if using)
  else if (event.authorization && event.authorization.roles) {
    roles = event.authorization.roles;
  }
  // Default: No roles assigned
  else {
    roles = [];
    console.warn('No roles found for user:', event.user.email);
  }

  console.log('Extracted roles for user', event.user.email, ':', roles);

  // Add custom claims to both ID and Access tokens
  audiences.forEach(audience => {
    const rolesClaim = `${audience}/roles`;
    
    // Add to ID Token (always available)
    api.idToken.setCustomClaim(rolesClaim, roles);
    
    // Add to Access Token only if audience matches request
    if (event.request.body && event.request.body.audience === audience) {
      api.accessToken.setCustomClaim(rolesClaim, roles);
      console.log('Added access token claims for audience:', audience);
    }
  });

  // Log successful execution
  console.log('Form137 Role Claims Action completed successfully');
};
```

## Step 3: Deploy and Test Action

1. **Save and Deploy**:
   - Click **Save Draft**
   - Click **Deploy**

2. **Add to Login Flow**:
   - Go to **Actions** → **Flows** → **Login**
   - Drag your action into the flow
   - Click **Apply**

## Step 4: Assign Roles to User

### Method A: Via Auth0 Dashboard

1. **Navigate to Users**:
   - Go to **User Management** → **Users**
   - Find user: `jason@cspb.edu.ph`

2. **Update App Metadata**:
   - Click on the user
   - Go to **Metadata** tab
   - In **app_metadata** field, add:

```json
{
  "roles": ["Admin", "Requester"]
}
```

3. **Save Changes**

### Method B: Via Auth0 Management API

```bash
# Using Auth0 CLI (if installed)
auth0 users update auth0|687515def8dcc9049a9c9b57 \
  --app-metadata '{"roles": ["Admin", "Requester"]}'

# Or using curl
curl -X PATCH https://jasoncalalang.auth0.com/api/v2/users/auth0|687515def8dcc9049a9c9b57 \
  -H "Authorization: Bearer YOUR_MGMT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"app_metadata": {"roles": ["Admin", "Requester"]}}'
```

## Step 5: Verify Configuration

1. **Test Login Flow**:
   - Clear browser cookies/session
   - Navigate to http://localhost:3000
   - Login with `jason@cspb.edu.ph`

2. **Check Token Claims**:
   - After login, visit `/debug-auth` page
   - Check browser console for role extraction logs
   - Verify JWT token at https://jwt.io contains custom claims

3. **Expected Token Structure**:
```json
{
  "https://form137.cspb.edu.ph/api/roles": ["Admin", "Requester"],
  "http://localhost:8080/api/roles": ["Admin", "Requester"],
  "sub": "auth0|687515def8dcc9049a9c9b57",
  "email": "jason@cspb.edu.ph",
  "name": "Jason Calalang",
  "iss": "https://jasoncalalang.auth0.com/",
  "aud": "https://form137.cspb.edu.ph/api"
}
```

## Security Notes

- **App Metadata vs User Metadata**: Use app_metadata for roles as it's not user-editable
- **Namespace Claims**: Custom claims must use namespaced format (URL-based)
- **Audience Validation**: Claims are added based on requested audience
- **Logging**: Action includes comprehensive logging for debugging

## Troubleshooting

**If roles still not appearing:**
1. Check Action is deployed and enabled in Login flow
2. Verify user has roles in app_metadata
3. Clear browser session completely
4. Check Action logs in Auth0 Dashboard
5. Verify audience in environment variables matches token claims

**Common Issues:**
- Action not deployed: Deploy the action after saving
- Action not in flow: Drag action into Login flow and apply
- Missing app_metadata: Add roles to user's app_metadata
- Cached tokens: Clear browser session to get fresh tokens