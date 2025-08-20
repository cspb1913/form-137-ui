import { auth0 } from "@/lib/auth0"
import { NextResponse } from "next/server"

interface UserWithRoles {
  sub: string
  name?: string
  email?: string
  picture?: string
  roles?: string[]
  [key: string]: any
}

export async function GET() {
  try {
    // Check if we're in development mode
    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
      // Return mock user data for development mode
      const mockUser: UserWithRoles = {
        sub: 'dev|development-user',
        email: 'dev@example.com',
        name: 'Development User',
        nickname: 'dev',
        picture: '/placeholder-user.jpg',
        email_verified: true,
        updated_at: new Date().toISOString(),
        roles: ['Admin', 'Requester'] // Give both roles for testing
      }
      
      console.log('🔧 Development Mode: Returning mock user data')
      return NextResponse.json({ user: mockUser })
    }

    const session = await auth0.getSession()
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Extract roles from custom claims in the token
    // Auth0 typically stores roles in custom claims like 'https://yourdomain.com/roles'
    const user = session.user as UserWithRoles
    let roles: string[] = []

    // Extract roles from Auth0 custom claims - audience-based approach
    // This matches the Auth0 Action configuration we'll set up
    const audience = process.env.AUTH0_AUDIENCE || process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
    const audienceRolesClaim = audience ? `${audience}/roles` : null
    
    // Primary role extraction from custom claims (set by Auth0 Action)
    if (audienceRolesClaim && user[audienceRolesClaim]) {
      roles = user[audienceRolesClaim]
    } 
    // Fallback to standard Auth0 patterns
    else if (user['https://form137.cspb.edu.ph/api/roles']) {
      roles = user['https://form137.cspb.edu.ph/api/roles']
    }
    else if (user['http://localhost:8080/api/roles']) {
      roles = user['http://localhost:8080/api/roles'] 
    }
    // Legacy role claim locations for backward compatibility
    else if (user['https://form137portal.com/roles']) {
      roles = user['https://form137portal.com/roles']
    } 
    // Auth0 Authorization Extension pattern
    else if (user['authorization']?.roles) {
      roles = user['authorization'].roles
    }
    // App metadata approach
    else if (user['app_metadata']?.roles) {
      roles = user['app_metadata'].roles
    }
    // User metadata approach  
    else if (user['user_metadata']?.roles) {
      roles = user['user_metadata'].roles
    }
    // Direct roles claim
    else if (user['roles']) {
      roles = user['roles']
    }
    else {
      // Final fallback - search for any role-related claims
      const possibleRoleClaims = Object.keys(user).filter(key => 
        (key.includes('roles') || key.includes('role')) && 
        !key.includes('picture') // exclude profile picture URLs
      )
      for (const claim of possibleRoleClaims) {
        if (Array.isArray(user[claim]) && user[claim].length > 0) {
          roles = user[claim]
          console.log(`Found roles in fallback claim: ${claim}`, roles)
          break
        }
      }
    }

    // Ensure roles is always an array
    if (!Array.isArray(roles)) {
      roles = []
    }

    // Add comprehensive debugging to help identify role retrieval issues
    console.log('Auth0 user role extraction debug:', {
      email: user.email,
      sub: user.sub,
      userKeys: Object.keys(user),
      customClaim: user['https://form137portal.com/roles'],
      vercelClaim1: user['https://cspb-form-137-requestor.vercel.app/roles'],
      vercelClaim2: user['https://v0-form-137.vercel.app/roles'],
      dynamicClaim: audienceRolesClaim ? user[audienceRolesClaim] : undefined,
      dynamicClaimUrl: audienceRolesClaim,
      directRoles: user['roles'],
      userRoles: user['user_roles'],
      appMetadata: user['app_metadata'],
      userMetadata: user['user_metadata'],
      authorization: user['authorization'],
      permissions: user['permissions'],
      extractedRoles: roles,
      // Log the entire user object structure (excluding sensitive data)
      userStructure: Object.keys(user).reduce((acc, key) => {
        if (typeof user[key] === 'object' && user[key] !== null) {
          acc[key] = Object.keys(user[key])
        } else {
          acc[key] = typeof user[key]
        }
        return acc
      }, {} as any)
    })

    // Log warning if no roles found - this indicates a configuration issue
    if (roles.length === 0) {
      console.warn('No roles found for user:', {
        email: user.email,
        sub: user.sub,
        userKeys: Object.keys(user)
      })
      // Don't assign default roles - let the application handle users without roles
      // This prevents masking role configuration issues in Auth0
    }

    const userWithRoles = {
      ...user,
      roles
    }

    return NextResponse.json({ user: userWithRoles })
  } catch (error) {
    console.error("Auth session error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
