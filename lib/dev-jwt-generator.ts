/**
 * Development JWT Token Generator
 * 
 * This module generates fake JWT tokens for development mode that can be
 * validated by the Spring Boot backend when running in development mode.
 * 
 * WARNING: These tokens are NOT secure and should NEVER be used in production!
 */

interface DevJWTPayload {
  sub: string
  aud: string
  iss: string
  exp: number
  iat: number
  azp: string
  scope: string
  email?: string
  name?: string
  roles?: string[]
  [key: string]: any
}

interface DevJWTHeader {
  alg: string
  typ: string
  kid?: string
}

/**
 * Simple base64url encoding (for development only)
 */
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

/**
 * Generate a development JWT token
 */
export function generateDevJWT(options: {
  email?: string
  name?: string
  role?: string
  expirationHours?: number
}): string {
  const {
    email = "dev@example.com",
    name = "Development User",
    role = "Requester",
    expirationHours = 24,
  } = options

  const now = Math.floor(Date.now() / 1000)
  const exp = now + (expirationHours * 3600)

  const header: DevJWTHeader = {
    alg: "HS256",
    typ: "JWT",
    kid: "dev-key-id",
  }

  const payload: DevJWTPayload = {
    sub: `dev|${email.split("@")[0]}`,
    aud: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "https://form137.cspb.edu.ph/api",
    iss: "https://dev.auth0.com/",
    exp,
    iat: now,
    azp: "development-client",
    scope: "openid profile email",
    email,
    name,
    email_verified: true,
    [`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "https://form137.cspb.edu.ph/api"}/roles`]: [role],
    // Add custom claims that might be expected by the backend
    roles: [role],
    permissions: getPermissionsForRole(role),
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  
  // For development, we'll use a predictable signature
  // In a real scenario, this would be properly signed with a secret
  const signature = base64urlEncode(`dev-signature-${encodedHeader}-${encodedPayload}`)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Get permissions based on role (simulates Auth0 RBAC)
 */
function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case "Admin":
      return [
        "read:requests",
        "write:requests",
        "delete:requests",
        "read:admin",
        "write:admin",
        "manage:users",
      ]
    case "Requester":
      return [
        "read:own-requests",
        "write:own-requests",
        "submit:form137",
      ]
    default:
      return []
  }
}

/**
 * Parse a JWT token (for development debugging)
 */
export function parseDevJWT(token: string): { header: any, payload: any } | null {
  try {
    const [headerB64, payloadB64] = token.split(".")
    
    const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")))
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")))
    
    return { header, payload }
  } catch (error) {
    console.error("Failed to parse JWT:", error)
    return null
  }
}

/**
 * Check if a JWT token is expired
 */
export function isJWTExpired(token: string): boolean {
  const parsed = parseDevJWT(token)
  if (!parsed) return true
  
  const now = Math.floor(Date.now() / 1000)
  return parsed.payload.exp < now
}

/**
 * Generate different user profiles for testing
 */
export const DEV_USER_PROFILES = {
  admin: {
    email: "admin@example.com",
    name: "Admin User",
    role: "Admin",
  },
  requester: {
    email: "requester@example.com",
    name: "Requester User",
    role: "Requester",
  },
  student: {
    email: "student@example.com",
    name: "Student User",
    role: "Requester",
  },
} as const

/**
 * Generate tokens for different user types
 */
export function generateTokenForProfile(profileName: keyof typeof DEV_USER_PROFILES): string {
  const profile = DEV_USER_PROFILES[profileName]
  return generateDevJWT(profile)
}