import { getCustomToken, AuthenticatedHttpClient } from "@/lib/auth-http-client"
import { fetchMock } from "@jest/globals"

// Mock fetch for testing
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe("Custom Authentication", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Clear environment variables
    delete process.env.NEXT_PUBLIC_API_BASE_URL
    delete process.env.NEXT_PUBLIC_FORM137_API_URL
    delete process.env.NEXT_PUBLIC_CSPB_API_SECRET
  })

  describe("getCustomToken", () => {
    it("should generate token with valid API secret", async () => {
      // Setup environment
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080"
      process.env.NEXT_PUBLIC_CSPB_API_SECRET = "test-secret-key"

      // Mock successful response
      const mockResponse = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token",
        token_type: "Bearer",
        expires_in: 86400,
        scope: "openid profile email",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      // Test token generation
      const token = await getCustomToken({
        email: "admin@example.com",
        name: "System Administrator",
        role: "Admin",
      })

      expect(token).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token")
      
      // Verify request was made correctly
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/auth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSPB-Secret": "test-secret-key",
          },
          body: JSON.stringify({
            email: "admin@example.com",
            name: "System Administrator",
            role: "Admin",
          }),
        }
      )
    })

    it("should use default values when user info is incomplete", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080"
      process.env.NEXT_PUBLIC_CSPB_API_SECRET = "test-secret-key"

      const mockResponse = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.default.token",
        token_type: "Bearer",
        expires_in: 86400,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      // Test with empty user info
      const token = await getCustomToken({})

      expect(token).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.default.token")
      
      // Verify default values were used
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            email: "user@example.com",
            name: "User",
            role: "Requester",
          }),
        })
      )
    })

    it("should handle API errors gracefully", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080"
      process.env.NEXT_PUBLIC_CSPB_API_SECRET = "test-secret-key"

      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      } as Response)

      // Test error handling
      await expect(getCustomToken({
        email: "user@example.com",
        name: "Test User",
        role: "Requester",
      })).rejects.toThrow("Custom authentication failed. Please try again.")
    })

    it("should use fallback API URL when base URL is not set", async () => {
      process.env.NEXT_PUBLIC_FORM137_API_URL = "http://localhost:3001"
      process.env.NEXT_PUBLIC_CSPB_API_SECRET = "test-secret-key"

      const mockResponse = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fallback.token",
        token_type: "Bearer",
        expires_in: 86400,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      await getCustomToken({ email: "test@example.com" })

      // Verify fallback URL was used
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/auth/token",
        expect.any(Object)
      )
    })

    it("should use default API secret when not configured", async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080"
      // Don't set NEXT_PUBLIC_CSPB_API_SECRET

      const mockResponse = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.default.secret.token",
        token_type: "Bearer",
        expires_in: 86400,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      await getCustomToken({ email: "test@example.com" })

      // Verify default secret was used
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-CSPB-Secret": "cspb-secure-api-key-2025",
          }),
        })
      )
    })
  })

  describe("AuthenticatedHttpClient", () => {
    let client: AuthenticatedHttpClient

    beforeEach(() => {
      client = new AuthenticatedHttpClient({
        baseUrl: "http://localhost:8080",
        defaultAudience: "https://form137.cspb.edu.ph/api",
      })
    })

    it("should make authenticated requests with Bearer token", async () => {
      const mockResponse = { success: true, data: "test data" }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response)

      const result = await client.get<typeof mockResponse>(
        "/api/test",
        "mock-access-token",
        true
      )

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        })
      )
    })

    it("should throw error when authentication is required but no token provided", async () => {
      await expect(client.get("/api/protected", undefined, true))
        .rejects.toThrow("Authentication required but no access token provided")
    })

    it("should make unauthenticated requests when auth is not required", async () => {
      const mockResponse = { public: "data" }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response)

      const result = await client.get<typeof mockResponse>("/api/public", undefined, false)

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/public",
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      )
    })

    it("should handle POST requests with JSON body", async () => {
      const requestData = { name: "test", value: 123 }
      const mockResponse = { id: "created", ...requestData }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ "content-type": "application/json" }),
      } as Response)

      const result = await client.post<typeof mockResponse>(
        "/api/create",
        requestData,
        "mock-token",
        true
      )

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/create",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          }),
        })
      )
    })

    it("should handle HTTP errors gracefully", async () => {
      const errorResponse = { error: "Not Found", message: "Resource not found" }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => errorResponse,
      } as Response)

      await expect(client.get("/api/nonexistent", "token", true))
        .rejects.toThrow("Resource not found")
    })

    it("should handle non-JSON responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "text/plain" }),
      } as Response)

      const result = await client.get("/api/plain-text", "token", false)

      expect(result).toEqual({})
    })
  })
})