import { NextResponse, NextRequest } from "next/server"
import { auth0 } from "@/lib/auth0"
import { httpClient } from "@/lib/auth-http-client"

interface UserWithRoles {
  sub: string
  name?: string
  email?: string
  picture?: string
  roles?: string[]
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get('appSession')
    
    if (!sessionCookie) {
      console.log('No session cookie found')
      return NextResponse.json({ user: null }, { status: 401 })
    }
    
    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch (e) {
      console.error('Invalid session cookie format')
      return NextResponse.json({ user: null }, { status: 401 })
    }
    
    // Check if session is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      console.log('Session expired')
      return NextResponse.json({ user: null }, { status: 401 })
    }
    
    if (!session.idToken) {
      console.log('No ID token in session')
      return NextResponse.json({ user: null }, { status: 401 })
    }
    
    // Decode the JWT ID token (simplified - in production use proper JWT verification)
    const base64Payload = session.idToken.split('.')[1]
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
    
    console.log('JWT payload:', payload)
    
    // Extract user info and roles from the token
    const user: UserWithRoles = {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      nickname: payload.nickname,
      picture: payload.picture,
      email_verified: payload.email_verified,
      updated_at: payload.updated_at,
      roles: payload[`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/roles`] || []
    }
    
    console.log('User with roles:', user)
    return NextResponse.json({ user })
    
  } catch (error) {
    console.error("Auth session error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        }
      }
    )
  }
}
