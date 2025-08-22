import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAccessToken } from '@auth0/nextjs-auth0/server'

/**
 * Secure server-side API route for updating request status
 * Implements proper JWT validation and admin authorization
 */
export async function PATCH(
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

    // 2. Verify user has Admin role for status updates
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
    const body = await request.json()
    const { status } = body

    const validStatuses = ['submitted', 'processing', 'under_review', 'approved', 'rejected', 'completed']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' }, 
        { status: 400 }
      )
    }

    // 5. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/requests/${params.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to update status: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 6. Return updated request
    const updatedRequest = await response.json()
    return NextResponse.json(updatedRequest)

  } catch (error) {
    console.error('Failed to update request status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}