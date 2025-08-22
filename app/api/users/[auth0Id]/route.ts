import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAccessToken } from '@auth0/nextjs-auth0/server'

/**
 * Secure server-side API route for individual user management
 * Implements proper JWT validation and access control
 */
export async function GET(
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

    // 2. Get validated Auth0 access token
    const accessToken = await getAccessToken(request, {
      audience: process.env.AUTH0_AUDIENCE,
    })

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to retrieve access token' }, 
        { status: 401 }
      )
    }

    // 3. Check access permissions (users can access their own data, admins can access any)
    const userRoles = session.user[`${process.env.AUTH0_AUDIENCE}/roles`] || []
    const isAdmin = userRoles.includes('Admin')
    const isOwnData = session.user.sub === params.auth0Id
    
    if (!isAdmin && !isOwnData) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' }, 
        { status: 403 }
      )
    }

    // 4. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const encodedAuth0Id = encodeURIComponent(params.auth0Id)
    const response = await fetch(`${backendUrl}/api/users/${encodedAuth0Id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' }, 
          { status: 404 }
        )
      }
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Backend API error: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 5. Return user data
    const user = await response.json()
    return NextResponse.json(user)

  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

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

    // 2. Get validated Auth0 access token
    const accessToken = await getAccessToken(request, {
      audience: process.env.AUTH0_AUDIENCE,
    })

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to retrieve access token' }, 
        { status: 401 }
      )
    }

    // 3. Check access permissions (users can update their own data, admins can update any)
    const userRoles = session.user[`${process.env.AUTH0_AUDIENCE}/roles`] || []
    const isAdmin = userRoles.includes('Admin')
    const isOwnData = session.user.sub === params.auth0Id
    
    if (!isAdmin && !isOwnData) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' }, 
        { status: 403 }
      )
    }

    // 4. Parse request body
    const userData = await request.json()

    // 5. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const encodedAuth0Id = encodeURIComponent(params.auth0Id)
    const response = await fetch(`${backendUrl}/api/users/${encodedAuth0Id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to update user: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 6. Return updated user
    const updatedUser = await response.json()
    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // 2. Verify user has Admin role for user deletion
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
    const encodedAuth0Id = encodeURIComponent(params.auth0Id)
    const response = await fetch(`${backendUrl}/api/users/${encodedAuth0Id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to delete user: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 5. Return deleted user (soft delete)
    const deletedUser = await response.json()
    return NextResponse.json(deletedUser)

  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
