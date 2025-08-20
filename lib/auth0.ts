import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const auth0 = new Auth0Client({
  routes: {
    login: "/api/auth/login",
    logout: "/api/auth/logout", 
    callback: "/api/auth/callback",
    profile: "/api/auth/me",
  },
  authorizationParams: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile email offline_access",
    // Enable PKCE for security
    response_type: "code",
    response_mode: "query"
  },
  session: {
    rollingDuration: 24 * 60 * 60, // 24 hours
    absoluteDuration: 7 * 24 * 60 * 60, // 7 days
    // Security enhancements
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
    // Rolling sessions for enhanced security
    rolling: true,
    autoSave: true,
    autoRefresh: true
  },
  // Security headers and options
  clockTolerance: 60, // 60 seconds clock skew tolerance
  httpTimeout: 5000, // 5 second timeout
  // Enable backchannel logout support
  backchannelLogout: true
})
