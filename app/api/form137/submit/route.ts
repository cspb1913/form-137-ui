import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAccessToken } from '@auth0/nextjs-auth0/server'

/**
 * Secure server-side API route for Form 137 submission
 * Implements proper JWT validation and user authorization
 */
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

    // 2. Verify user has appropriate role for form submission
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

    // 4. Parse request body
    const formData = await request.json()

    // 5. Basic validation
    if (!formData.learnerReferenceNumber || !formData.firstName || !formData.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // 6. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/form137/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 400) {
        return NextResponse.json(
          {
            error: errorData.error || 'Validation Error',
            message: errorData.message || 'Form validation failed',
            statusCode: 400,
            details: errorData.details || {}
          }, 
          { status: 400 }
        )
      }
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to submit form: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 7. Return submission result
    const submissionResult = await response.json()
    return NextResponse.json(submissionResult, { status: 201 })

  } catch (error) {
    console.error('Failed to submit form:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
