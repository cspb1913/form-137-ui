import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAccessToken } from '@auth0/nextjs-auth0/server'

/**
 * Secure server-side API route for Form 137 status checking
 * Implements proper JWT validation and user authorization
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { ticketNumber: string } }
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

    // 2. Verify user has appropriate role for status checking
    const userRoles = session.user[`${process.env.AUTH0_AUDIENCE}/roles`] || []
    const hasRequiredRole = userRoles.includes('Requester') || userRoles.includes('Admin')
    
    if (!hasRequiredRole) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' }, 
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
    const response = await fetch(`${backendUrl}/api/form137/status/${params.ticketNumber}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'Submission not found',
            statusCode: 404
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

    // 5. Return submission status
    const submissionStatus = await response.json()
    return NextResponse.json(submissionStatus)

  } catch (error) {
    console.error('Failed to get submission status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
