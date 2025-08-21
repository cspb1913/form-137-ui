import { Pact } from "@pact-foundation/pact"
import { like } from "@pact-foundation/pact/src/dsl/matchers"
import { getCustomToken } from "@/lib/auth-http-client"
import path from "path"

const mockProvider = new Pact({
  consumer: "Form137Frontend",
  provider: "CustomAuthAPI",
  port: 1237,
  log: path.resolve(process.cwd(), "logs", "custom-auth-pact.log"),
  dir: path.resolve(process.cwd(), "pacts"),
  logLevel: "INFO",
})

describe("Custom Auth API Pact Tests", () => {
  beforeAll(async () => {
    await mockProvider.setup()
  })

  afterAll(async () => {
    await mockProvider.finalize()
  })

  afterEach(async () => {
    await mockProvider.verify()
  })

  describe("POST /api/auth/token", () => {
    test("should generate token with valid X-CSPB-Secret header", async () => {
      await mockProvider.addInteraction({
        state: "Valid X-CSPB-Secret header is provided",
        uponReceiving: "a request for custom JWT token with valid secret",
        withRequest: {
          method: "POST",
          path: "/api/auth/token",
          headers: {
            "Content-Type": "application/json",
            "x-cspb-client-id": "f725239a-f2ff-4be2-834c-196754d7feea",
            "x-cspb-client-secret": "fTZXWX5mmfvlecwY",
          },
          body: {
            email: like("admin@example.com"),
            name: like("System Administrator"),
            role: like("Admin"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            access_token: like("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."),
            token_type: "Bearer",
            expires_in: 86400,
            scope: "openid profile email",
          },
        },
      })

      // Mock the API base URL for testing
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:1237"
      process.env.NEXT_PUBLIC_CSPB_API_SECRET = "test-secret-key-for-pact-tests"

      try {
        const token = await getCustomToken({
          email: "admin@example.com",
          name: "System Administrator",
          role: "Admin",
        })

        expect(token).toMatch(/^eyJ/)
        expect(typeof token).toBe("string")
      } finally {
        process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv
      }
    })

    test("should reject request with invalid X-CSPB-Secret header", async () => {
      await mockProvider.addInteraction({
        state: "Invalid or missing X-CSPB-Secret header",
        uponReceiving: "a request for custom JWT token with invalid secret",
        withRequest: {
          method: "POST",
          path: "/api/auth/token",
          headers: {
            "Content-Type": "application/json",
            "x-cspb-client-id": "f725239a-f2ff-4be2-834c-196754d7feea",
            "x-cspb-client-secret": "invalid-secret",
          },
          body: {
            email: like("user@example.com"),
            name: like("Test User"),
            role: like("Requester"),
          },
        },
        willRespondWith: {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: "forbidden",
            error_description: "Invalid or missing X-CSPB-Secret header",
          },
        },
      })

      // Mock the API base URL for testing
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:1237"
      process.env.NEXT_PUBLIC_CSPB_API_SECRET = "invalid-secret"

      try {
        await expect(getCustomToken({
          email: "user@example.com",
          name: "Test User",
          role: "Requester",
        })).rejects.toThrow("Custom authentication failed")
      } finally {
        process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv
      }
    })
  })

  describe("GET /api/auth/.well-known/jwks.json", () => {
    test("should return JWKS for token validation", async () => {
      await mockProvider.addInteraction({
        state: "JWKS endpoint is available",
        uponReceiving: "a request for JWKS",
        withRequest: {
          method: "GET",
          path: "/api/auth/.well-known/jwks.json",
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            keys: [
              {
                kty: "oct",
                kid: like("custom-key-1"),
                use: "sig",
                alg: "HS256",
                k: like("ZGV2ZWxvcG1lbnQtc2VjcmV0LWtleQ"),
              },
            ],
          },
        },
      })

      const response = await fetch("http://localhost:1237/api/auth/.well-known/jwks.json", {
        headers: { Accept: "application/json" },
      })

      expect(response.status).toBe(200)
      const jwks = await response.json()
      expect(jwks).toHaveProperty("keys")
      expect(jwks.keys).toHaveLength(1)
      expect(jwks.keys[0]).toHaveProperty("kty", "oct")
      expect(jwks.keys[0]).toHaveProperty("alg", "HS256")
    })
  })

  describe("POST /api/auth/admin-token", () => {
    test("should generate admin token with valid secret", async () => {
      await mockProvider.addInteraction({
        state: "Admin token can be generated",
        uponReceiving: "a request for admin token with valid secret",
        withRequest: {
          method: "POST",
          path: "/api/auth/admin-token",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-cspb-client-id": "f725239a-f2ff-4be2-834c-196754d7feea",
            "x-cspb-client-secret": "fTZXWX5mmfvlecwY",
          },
          query: {
            email: "admin@example.com",
            name: "System Administrator",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            access_token: like("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."),
            token_type: "Bearer",
            expires_in: 86400,
            role: "Admin",
            email: "admin@example.com",
            name: "System Administrator",
          },
        },
      })

      const response = await fetch("http://localhost:1237/api/auth/admin-token?email=admin@example.com&name=System Administrator", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSPB-Secret": "test-secret-key-for-pact-tests",
        },
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result).toHaveProperty("access_token")
      expect(result).toHaveProperty("role", "Admin")
      expect(result.access_token).toMatch(/^eyJ/)
    })
  })
})