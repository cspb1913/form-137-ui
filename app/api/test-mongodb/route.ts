import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing MongoDB API connection...')
    
    // Get Auth0 access token for the current user
    const tokenResult = await getAccessToken(request as any, {
      audience: process.env.AUTH0_AUDIENCE
    })
    
    if (!tokenResult.accessToken) {
      return NextResponse.json({ 
        error: 'No access token available',
        authenticated: false 
      }, { status: 401 })
    }
    
    console.log('✅ Got Auth0 token:', tokenResult.accessToken.substring(0, 20) + '...')
    
    // Test MongoDB API call
    const apiUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || 'http://localhost:8080'
    const mongoUrl = `${apiUrl}/api/users/me`
    
    console.log('📡 Calling MongoDB API:', mongoUrl)
    
    const response = await fetch(mongoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenResult.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 MongoDB API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ MongoDB API error:', errorText)
      return NextResponse.json({
        error: `MongoDB API error: ${response.status} ${response.statusText}`,
        details: errorText,
        authenticated: true,
        apiUrl: mongoUrl
      }, { status: response.status })
    }
    
    const userData = await response.json()
    console.log('✅ MongoDB API success:', userData)
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      apiUrl: mongoUrl,
      user: userData,
      tokenPreview: tokenResult.accessToken.substring(0, 20) + '...'
    })
    
  } catch (error) {
    console.error('❌ Test MongoDB API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      authenticated: false
    }, { status: 500 })
  }
}