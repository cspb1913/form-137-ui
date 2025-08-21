import { getAccessToken } from "@auth0/nextjs-auth0"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 /api/auth/access-token called')
    
    // Check if we're in development mode
    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
      console.log('🔧 Development mode: returning mock access token')
      
      // Generate a simple mock JWT-like token for development
      const mockToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzA5NzQ5In0.eyJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODAiLCJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfGRldi11c2VyIiwicm9sZXMiOlsiQWRtaW4iLCJSZXF1ZXN0ZXIiXSwiZXhwIjo5OTk5OTk5OTk5fQ.mock-signature-for-development"
      
      return NextResponse.json({ 
        access_token: mockToken,
        token_type: "Bearer",
        expires_in: 86400
      })
    }

    // Try to get the Auth0 access token for the API directly
    let accessToken = null
    
    try {
      const tokenResult = await getAccessToken(request, {
        audience: process.env.AUTH0_AUDIENCE || 'http://localhost:8080/api',
        scope: 'openid profile email'
      })
      accessToken = tokenResult.accessToken
      console.log('✅ Retrieved Auth0 access token successfully')
    } catch (tokenError) {
      console.warn('⚠️ Could not get access token, trying alternative approaches:', tokenError)
      
      // Alternative 1: Check if session contains access_token
      if ((session as any).access_token) {
        accessToken = (session as any).access_token
        console.log('📋 Using access_token from session')
      }
      // Alternative 2: Check if session contains id_token (can be used for API authentication)  
      else if ((session as any).idToken) {
        accessToken = (session as any).idToken
        console.log('📋 Using idToken from session as fallback')
      }
      // Alternative 3: Try to extract token from session
      else {
        console.log('📋 Session structure:', Object.keys(session))
        console.log('📋 User structure:', Object.keys(session.user))
        
        // For development purposes, return a notice that tokens aren't available
        console.error('❌ No access tokens available in any form')
        return NextResponse.json(
          { 
            error: "No access token available",
            debug: {
              sessionKeys: Object.keys(session),
              userKeys: Object.keys(session.user),
              hasAccessToken: !!(session as any).access_token,
              hasIdToken: !!(session as any).idToken
            }
          }, 
          { status: 500 }
        )
      }
    }

    if (!accessToken) {
      console.error('❌ No access token available')
      return NextResponse.json(
        { error: "No access token available" }, 
        { status: 401 }
      )
    }

    console.log('✅ Auth0 access token retrieved successfully', {
      tokenPreview: accessToken.substring(0, 20) + '...',
      audience: process.env.AUTH0_AUDIENCE || 'http://localhost:8080/api'
    })

    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer"
    })

  } catch (error) {
    console.error("❌ Failed to get access token:", error)
    return NextResponse.json(
      { error: "Failed to get access token", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}