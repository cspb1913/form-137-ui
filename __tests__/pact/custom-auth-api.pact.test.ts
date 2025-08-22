import { Pact } from "@pact-foundation/pact"
import { like } from "@pact-foundation/pact/src/dsl/matchers"
import { AuthenticatedHttpClient } from "@/lib/auth-http-client"
import path from "path"

const mockProvider = new Pact({
  consumer: "Form137Frontend",
  provider: "Form137API",
  port: 1237,
  log: path.resolve(process.cwd(), "logs", "auth0-integration-pact.log"),
  dir: path.resolve(process.cwd(), "pacts"),
  logLevel: "INFO",
})

describe("Auth0 Integration Pact Tests", () => {
  const httpClient = new AuthenticatedHttpClient({ baseUrl: "http://localhost:1237" })
  const mockAuth0Token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5In0.eyJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tIiwiYXVkIjoiaHR0cHM6Ly9mb3JtMTM3LmNzcGIuZWR1LnBoL2FwaSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsInJvbGVzIjpbIkFkbWluIl19.fake-signature"

  beforeAll(async () => {
    await mockProvider.setup()
  })

  afterAll(async () => {
    await mockProvider.finalize()
  })

  afterEach(async () => {
    await mockProvider.verify()
  })

  describe("GET /api/health/liveness", () => {
    test("should check API health without authentication", async () => {
      await mockProvider.addInteraction({
        state: "API is healthy",
        uponReceiving: "a request for health check",
        withRequest: {
          method: "GET",
          path: "/api/health/liveness",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            status: "UP",
            timestamp: like("2024-01-15T10:30:00Z"),
          },
        },
      })

      const response = await httpClient.get<{status: string}>("/api/health/liveness")

      expect(response.status).toBe("UP")
    })

  })

  describe("Protected Endpoint Authentication", () => {
    test("should reject request without Auth0 token", async () => {
      await mockProvider.addInteraction({
        state: "No authentication token provided",
        uponReceiving: "a request for protected endpoint without token",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/requests",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        },
        willRespondWith: {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: "unauthorized",
            error_description: "Authorization header is required",
          },
        },
      })

      try {
        // Small delay to ensure interaction is registered
        await new Promise(resolve => setTimeout(resolve, 50))
        await httpClient.get("/api/dashboard/requests", undefined, false)
        fail("Should have thrown an error")
      } catch (error: any) {
        expect(error.message).toContain("unauthorized")
      }
    })

    test("should accept request with valid Auth0 token", async () => {
      await mockProvider.addInteraction({
        state: "Valid Auth0 token provided",
        uponReceiving: "a request for protected endpoint with valid Auth0 token",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/requests",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mockAuth0Token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            requests: [],
            totalCount: 0,
            statistics: {
              totalRequests: 0,
              pendingRequests: 0,
              completedRequests: 0,
              averageProcessingTime: 0,
            },
          },
        },
      })

      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      const response = await httpClient.get("/api/dashboard/requests", mockAuth0Token, true)

      expect(response).toHaveProperty("requests")
      expect(response).toHaveProperty("statistics")
    })

    test("should reject request with invalid Auth0 token", async () => {
      await mockProvider.addInteraction({
        state: "Invalid Auth0 token provided",
        uponReceiving: "a request for protected endpoint with invalid Auth0 token",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/requests",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer invalid-token",
          },
        },
        willRespondWith: {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: "invalid_token",
            error_description: "The access token provided is expired, revoked, malformed, or invalid",
          },
        },
      })

      try {
        // Small delay to ensure interaction is registered
        await new Promise(resolve => setTimeout(resolve, 50))
        await httpClient.get("/api/dashboard/requests", "invalid-token", true)
        fail("Should have thrown an error")
      } catch (error: any) {
        expect(error.message).toContain("invalid_token")
      }
    })
  })
})