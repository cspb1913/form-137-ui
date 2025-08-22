import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAccessToken } from '@auth0/nextjs-auth0/server'

/**
 * Secure server-side API route for individual request details
 * Implements proper JWT validation and access control
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
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

    // 3. Verify user has appropriate roles for dashboard access
    const userRoles = session.user[`${process.env.AUTH0_AUDIENCE}/roles`] || []
    const hasRequiredRole = userRoles.includes('Admin') || userRoles.includes('Requester')
    
    if (!hasRequiredRole) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' }, 
        { status: 403 }
      )
    }

    // 4. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/dashboard/request/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: 'Request not found',
            code: 'REQUEST_NOT_FOUND'
          }, 
          { status: 404 }
        )
      }
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Backend API error: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 5. Return request details
    const requestDetails = await response.json()
    return NextResponse.json(requestDetails)

  } catch (error) {
    console.error('Failed to fetch request details:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
