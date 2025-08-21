import { NextResponse, NextRequest } from "next/server"
import { getAccessToken } from "@auth0/nextjs-auth0"
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
    // Check if we're in development mode
    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
      // Return mock user data for development mode
      const mockUser: UserWithRoles = {
        sub: 'dev|development-user',
        email: 'dev@example.com',
        name: 'Development User',
        nickname: 'dev',
        picture: '/placeholder-user.jpg',
        email_verified: true,
        updated_at: new Date().toISOString(),
        roles: ['Admin', 'Requester'] // Give both roles for testing
      }
      
      console.log('🔧 Development Mode: Returning mock user data')
      return NextResponse.json({ user: mockUser })
    }

    // Production mode: Get Auth0 access token directly
    let accessToken = null
    try {
      const tokenResult = await getAccessToken(request, {
        audience: process.env.AUTH0_AUDIENCE || 'http://localhost:8080/api',
        scope: 'openid profile email'
      })
      accessToken = tokenResult.accessToken
      console.log('✅ Retrieved Auth0 access token for /api/auth/me')
    } catch (tokenError) {
      console.error('❌ Failed to get Auth0 access token:', tokenError)
      return NextResponse.json(
        { error: "Failed to retrieve access token" }, 
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="api"',
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
          }
        }
      )
    }

    // Use access token to get user data from MongoDB API
    try {
      console.log('🔧 Production Mode: Using Auth0 token to get user data from API')
      const userData = await httpClient.get('/api/users/me', accessToken, true)
      
      // Transform MongoDB user data to match frontend expectations
      const userWithRoles: UserWithRoles = {
        sub: userData.auth0Id || 'api-client-credentials',
        email: userData.email,
        name: userData.name,
        nickname: userData.profile?.firstName || 'API Client',
        picture: '/placeholder-user.jpg',
        email_verified: true,
        updated_at: userData.metadata?.updatedAt || new Date().toISOString(),
        roles: userData.roles || ['Admin', 'Requester']
      }
      
      console.log('✅ Client credentials user data:', userWithRoles)
      return NextResponse.json({ user: userWithRoles })
    } catch (apiError) {
      console.error('❌ Failed to get user from MongoDB API:', apiError)
      // Return 500 for API errors (not auth errors)
      return NextResponse.json(
        { error: "Failed to retrieve user data" }, 
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
          }
        }
      )
    }
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
