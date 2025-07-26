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
    if (user['https://form137portal.com/roles']) {
      roles = user['https://form137portal.com/roles']
    } else if (user['https://cspb-form-137-requestor.vercel.app/roles']) {
      roles = user['https://cspb-form-137-requestor.vercel.app/roles']
    } else if (user['https://v0-form-137.vercel.app/roles']) {
      roles = user['https://v0-form-137.vercel.app/roles']
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
    }

    // Ensure roles is always an array
    if (!Array.isArray(roles)) {
      roles = []
    }

    // Add debugging to help identify role retrieval issues
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth0 user role extraction debug:', {
        userKeys: Object.keys(user),
        customClaim: user['https://form137portal.com/roles'],
        vercelClaim1: user['https://cspb-form-137-requestor.vercel.app/roles'],
        vercelClaim2: user['https://v0-form-137.vercel.app/roles'],
        directRoles: user['roles'],
        userRoles: user['user_roles'],
        appMetadata: user['app_metadata'],
        userMetadata: user['user_metadata'],
        authorization: user['authorization'],
        permissions: user['permissions'],
        extractedRoles: roles
      })
    }

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
