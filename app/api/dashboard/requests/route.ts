import { NextRequest, NextResponse } from 'next/server'

interface UserWithRoles {
  sub: string
  name?: string
  email?: string
  picture?: string
  roles?: string[]
  [key: string]: any
}

/**
 * Secure server-side API route for fetching dashboard requests
 * Uses custom Auth0 session cookie validation
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract and validate custom session cookie
    const sessionCookie = request.cookies.get('appSession')
    
    if (!sessionCookie) {
      console.log('Dashboard API: No session cookie found')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      )
    }

    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch (e) {
      console.error('Dashboard API: Invalid session cookie format')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' }, 
        { status: 401 }
      )
    }

    // 2. Check if session is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      console.log('Dashboard API: Session expired')
      return NextResponse.json(
        { error: 'Unauthorized - Session expired' }, 
        { status: 401 }
      )
    }

    if (!session.accessToken || !session.idToken) {
      console.log('Dashboard API: Missing tokens in session')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session tokens' }, 
        { status: 401 }
      )
    }

    // 3. Decode the JWT ID token to get user info and roles
    const base64Payload = session.idToken.split('.')[1]
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
    
    // Extract user roles from the token
    const userRoles = payload[`${process.env.AUTH0_AUDIENCE}/roles`] || []
    console.log('Dashboard API: User roles from JWT:', userRoles)
    
    const hasRequiredRole = userRoles.includes('Admin') || userRoles.includes('Requester')
    
    if (!hasRequiredRole) {
      console.log('Dashboard API: User lacks required roles:', userRoles)
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions. No roles assigned.' }, 
        { status: 403 }
      )
    }

    // 4. Make authenticated backend API call using access token
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    console.log('Dashboard API: Making backend call to:', `${backendUrl}/api/dashboard/requests`)
    
    const response = await fetch(`${backendUrl}/api/dashboard/requests`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Dashboard API: Backend API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Dashboard API: Backend error details:', errorText)
      return NextResponse.json(
        { error: `Backend API error: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 5. Return dashboard data with proper user context
    const dashboardData = await response.json()
    console.log('Dashboard API: Successfully fetched dashboard data')
    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API: Failed to fetch dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}