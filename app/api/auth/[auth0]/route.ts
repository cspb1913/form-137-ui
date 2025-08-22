import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ auth0: string }> }) {
  const { auth0: action } = await params
  
  console.log('Auth0 action:', action)
  
  // Handle different Auth0 actions
  switch (action) {
    case 'login':
      // Redirect to Auth0 login
      const loginUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/authorize?` +
        `response_type=code&` +
        `client_id=${process.env.AUTH0_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.AUTH0_BASE_URL + '/api/auth/callback')}&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `audience=${encodeURIComponent(process.env.AUTH0_AUDIENCE || '')}`
      
      return NextResponse.redirect(loginUrl)
      
    case 'logout':
      // Redirect to Auth0 logout
      const logoutUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/logout?` +
        `client_id=${process.env.AUTH0_CLIENT_ID}&` +
        `returnTo=${encodeURIComponent(process.env.AUTH0_BASE_URL || '')}`
      
      const response = NextResponse.redirect(logoutUrl)
      // Clear the session cookie
      response.cookies.delete('appSession')
      return response
      
    case 'callback':
      // Handle the Auth0 callback - exchange code for tokens
      const url = new URL(request.url)
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      const errorDescription = url.searchParams.get('error_description')
      
      if (error) {
        console.error('Auth0 callback error:', error, errorDescription)
        return NextResponse.redirect(process.env.AUTH0_BASE_URL + '/?error=' + encodeURIComponent(error))
      }
      
      if (!code) {
        console.error('No authorization code in callback')
        return NextResponse.redirect(process.env.AUTH0_BASE_URL + '/?error=no_code')
      }
      
      try {
        // Exchange code for tokens
        const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.AUTH0_BASE_URL + '/api/auth/callback'
          })
        })
        
        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokenResponse.status}`)
        }
        
        const tokens = await tokenResponse.json()
        console.log('Auth0 tokens received:', { 
          hasAccessToken: !!tokens.access_token, 
          hasIdToken: !!tokens.id_token,
          tokenType: tokens.token_type 
        })
        
        // Create session cookie (simplified - in production use proper session management)
        const response = NextResponse.redirect(process.env.AUTH0_BASE_URL + '/')
        
        // Set a basic session cookie with the tokens
        response.cookies.set('appSession', JSON.stringify({
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000)
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: tokens.expires_in
        })
        
        return response
        
      } catch (error) {
        console.error('Auth0 callback processing error:', error)
        return NextResponse.redirect(process.env.AUTH0_BASE_URL + '/?error=callback_failed')
      }
      
    default:
      return NextResponse.json({ error: 'Invalid auth action' }, { status: 400 })
  }
}

export const POST = GET
