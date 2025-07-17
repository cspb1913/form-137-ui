import { initAuth0 } from "@auth0/nextjs-auth0"

const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET || "default_secret",
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || "https://example.com",
  baseURL: process.env.AUTH0_BASE_URL || "http://localhost:3000",
  clientID: process.env.AUTH0_CLIENT_ID || "dummy",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "dummy",
})

export const GET = auth0.handleAuth({
  login: auth0.handleLogin({
    returnTo: "/dashboard",
  }),
  logout: auth0.handleLogout({
    returnTo: "/",
  }),
  callback: auth0.handleCallback(),
  profile: auth0.handleProfile(),
})
