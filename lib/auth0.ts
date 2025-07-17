import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const auth0 = new Auth0Client({
  secret: process.env.AUTH0_SECRET || "default_secret",
  domain:
    process.env.AUTH0_DOMAIN ||
    process.env.AUTH0_ISSUER_BASE_URL ||
    "https://example.com",
  appBaseUrl:
    process.env.AUTH0_BASE_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000",
  clientId: process.env.AUTH0_CLIENT_ID || "dummy",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "dummy",
  routes: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    callback: "/api/auth/callback",
    profile: "/api/auth/me",
  },
})
