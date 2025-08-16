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

    // Try to extract roles from various possible claim locations
    // The order matters - try most specific first, then fall back to more general
    const auth0BaseUrl = process.env.AUTH0_BASE_URL
    const dynamicRolesClaim = auth0BaseUrl ? `${auth0BaseUrl}/roles` : null
    
    if (user['https://form137portal.com/roles']) {
      roles = user['https://form137portal.com/roles']
    } else if (user['https://cspb-form-137-requestor.vercel.app/roles']) {
      roles = user['https://cspb-form-137-requestor.vercel.app/roles']
    } else if (user['https://v0-form-137.vercel.app/roles']) {
      roles = user['https://v0-form-137.vercel.app/roles']
    } else if (user['https://form-137-ui.vercel.app/roles']) {
      roles = user['https://form-137-ui.vercel.app/roles']
    } else if (dynamicRolesClaim && user[dynamicRolesClaim]) {
      roles = user[dynamicRolesClaim]
    } else if (user['roles']) {
      roles = user['roles']
    } else if (user['user_roles']) {
      roles = user['user_roles']
    } else if (user['app_metadata']?.roles) {
      roles = user['app_metadata'].roles
    } else if (user['user_metadata']?.roles) {
      roles = user['user_metadata'].roles
    } else if (user['authorization']?.roles) {
      roles = user['authorization'].roles
    } else if (user['permissions']) {
      // Sometimes roles are stored as permissions
      roles = user['permissions']
    } else if (user['https://hasura.io/jwt/claims']?.['x-hasura-allowed-roles']) {
      // Hasura-style role claims
      roles = user['https://hasura.io/jwt/claims']['x-hasura-allowed-roles']
    } else if (user['https://hasura.io/jwt/claims']?.roles) {
      // Hasura-style role claims
      roles = user['https://hasura.io/jwt/claims'].roles
    } else {
      // Check for any custom namespace that might contain roles
      const possibleRoleClaims = Object.keys(user).filter(key => 
        key.includes('roles') || key.includes('role') || key.includes('permissions')
      )
      for (const claim of possibleRoleClaims) {
        if (Array.isArray(user[claim]) && user[claim].length > 0) {
          roles = user[claim]
          console.log(`Found roles in claim: ${claim}`, roles)
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
      dynamicClaim: dynamicRolesClaim ? user[dynamicRolesClaim] : undefined,
      dynamicClaimUrl: dynamicRolesClaim,
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
