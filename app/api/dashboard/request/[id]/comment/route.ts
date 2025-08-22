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
 * Secure server-side API route for adding comments to requests
 * Uses custom Auth0 session cookie validation
 */
export async function POST(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // 1. Extract and validate custom session cookie
    const sessionCookie = request.cookies.get('appSession')
    
    console.log('Comment API: All cookies received:', request.cookies.getAll())
    console.log('Comment API: appSession cookie:', sessionCookie)
    
    if (!sessionCookie) {
      console.log('Comment API: No session cookie found')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      )
    }

    // 2. Parse session data
    let session: any
    try {
      session = JSON.parse(sessionCookie.value)
      console.log('Comment API: Parsed session data (keys only):', Object.keys(session))
    } catch (error) {
      console.error('Comment API: Failed to parse session cookie:', error)
      return NextResponse.json(
        { error: 'Invalid session cookie' }, 
        { status: 401 }
      )
    }

    // 3. Check if session is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      console.log('Comment API: Session expired')
      return NextResponse.json(
        { error: 'Unauthorized - Session expired' }, 
        { status: 401 }
      )
    }

    if (!session.accessToken || !session.idToken) {
      console.log('Comment API: Missing tokens in session')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session tokens' }, 
        { status: 401 }
      )
    }

    // 4. Decode and validate access token using Buffer (same pattern as dashboard API)
    try {
      const accessTokenPayload = JSON.parse(Buffer.from(session.accessToken.split('.')[1], 'base64').toString())
      console.log('Comment API: Access token audience:', accessTokenPayload.aud)
      console.log('Comment API: Expected audience:', process.env.AUTH0_AUDIENCE)
      
      const expectedAudience = process.env.AUTH0_AUDIENCE
      const tokenAudience = Array.isArray(accessTokenPayload?.aud) ? accessTokenPayload.aud : [accessTokenPayload?.aud]
      const isValidAudience = tokenAudience.includes(expectedAudience)
      
      console.log('Comment API: JWT audience valid:', isValidAudience)
      
      if (!isValidAudience) {
        return NextResponse.json(
          { error: 'Invalid token audience' }, 
          { status: 401 }
        )
      }
    } catch (error) {
      console.error('Comment API: Failed to decode access token:', error)
      return NextResponse.json(
        { error: 'Invalid access token' }, 
        { status: 401 }
      )
    }

    // 5. Parse request body
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Comment message is required' }, 
        { status: 400 }
      )
    }

    // 6. Make authenticated backend API call
    const backendUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    console.log('Comment API: Making backend call to:', `${backendUrl}/api/dashboard/request/${params.id}/comment`)
    console.log('Comment API: Access token (first 50 chars):', session.accessToken.substring(0, 50) + '...')
    
    const response = await fetch(`${backendUrl}/api/dashboard/request/${params.id}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message.trim() }),
    })

    if (!response.ok) {
      console.error('Comment API: Backend API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Comment API: Backend error response:', errorText)
      return NextResponse.json(
        { error: `Failed to add comment: ${response.status}` }, 
        { status: response.status }
      )
    }

    // 7. Return created comment
    const comment = await response.json()
    console.log('Comment API: Successfully added comment')
    return NextResponse.json(comment, { status: 201 })

  } catch (error) {
    console.error('Comment API: Failed to add comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}