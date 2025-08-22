import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAccessToken } from '@auth0/nextjs-auth0/server'

/**
 * Secure server-side API route for user role management
 * Implements proper JWT validation and admin authorization
 */
export async function PUT(
  request: NextRequest, 
  { params }: { params: { auth0Id: string } }
) {
  try {
    // 1. Extract and validate JWT from session
    const session = await getSession(request)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      )
    }

    // 2. Verify user has Admin role for role management
    const userRoles = session.user[`${process.env.AUTH0_AUDIENCE}/roles`] || []
    if (!userRoles.includes('Admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      )
    }

    // 3. Get validated Auth0 access token
    const accessToken = await getAccessToken(request, {
      audience: process.env.AUTH0_AUDIENCE,
    })

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to retrieve access token' }, 
        { status: 401 }
      )
    }

    // 4. Parse request body
    const { roles } = await request.json()

    if (!Array.isArray(roles)) {
      return NextResponse.json(
        { error: 'Roles must be an array' }, 
        { status: 400 }
      )
    }

    // 5. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const encodedAuth0Id = encodeURIComponent(params.auth0Id)
    const response = await fetch(`${backendUrl}/api/users/${encodedAuth0Id}/roles`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roles }),
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to update user roles: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 6. Return updated user with new roles
    const updatedUser = await response.json()
    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Failed to update user roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
