import { initAuth0 } from "@auth0/nextjs-auth0"

export const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET || "default_secret",
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || "https://example.com",
  baseURL: process.env.AUTH0_BASE_URL || "http://localhost:3000",
  clientID: process.env.AUTH0_CLIENT_ID || "dummy",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "dummy",
})
