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
    if (user['https://form137portal.com/roles']) {
      roles = user['https://form137portal.com/roles']
    } else if (user['roles']) {
      roles = user['roles']
    } else if (user['user_roles']) {
      roles = user['user_roles']
    } else if (user['app_metadata']?.roles) {
      roles = user['app_metadata'].roles
    } else if (user['user_metadata']?.roles) {
      roles = user['user_metadata'].roles
    }

    // Ensure roles is always an array
    if (!Array.isArray(roles)) {
      roles = []
    }

    // Default role assignment if no roles found
    // This is a fallback for development/testing
    if (roles.length === 0) {
      // For now, assign "Requester" as default role
      // In production, this should be managed through Auth0 Role assignment
      roles = ["Requester"]
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
