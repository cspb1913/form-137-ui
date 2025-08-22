import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAccessToken } from '@auth0/nextjs-auth0/server'

/**
 * Secure server-side API route for user management
 * Implements proper JWT validation and role-based access control
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract and validate JWT from session
    const session = await getSession(request)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      )
    }

    // 2. Verify user has Admin role for user listing
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

    // 4. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/users`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Backend API error: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 5. Return user list
    const users = await response.json()
    return NextResponse.json(users)

  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract and validate JWT from session
    const session = await getSession(request)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      )
    }

    // 2. Verify user has Admin role for user creation
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
    const userData = await request.json()

    // 5. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to create user: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 6. Return created user
    const createdUser = await response.json()
    return NextResponse.json(createdUser)

  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
