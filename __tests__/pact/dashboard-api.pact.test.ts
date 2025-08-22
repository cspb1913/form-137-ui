import { Pact } from "@pact-foundation/pact"
import { like, eachLike } from "@pact-foundation/pact/src/dsl/matchers"
import { DashboardAPI } from "../../services/dashboard-api"
import { AuthenticatedHttpClient } from "@/lib/auth-http-client"

const provider = new Pact({
  consumer: "Form137Frontend",
  provider: "Form137API",
  port: 1234,
  log: "./logs/pact.log",
  dir: "./pacts",
  logLevel: "INFO",
})

describe("Dashboard API Pact Tests", () => {
  const mockAuth0Token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5In0.eyJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tIiwiYXVkIjoiaHR0cHM6Ly9mb3JtMTM3LmNzcGIuZWR1LnBoL2FwaSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsInJvbGVzIjpbIkFkbWluIl19.fake-signature"

  beforeAll(async () => await provider.setup())
  afterEach(async () => await provider.verify())
  afterAll(async () => await provider.finalize())

  describe("GET /api/dashboard/requests", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "user has form 137 requests",
        uponReceiving: "a request for dashboard data with Auth0 token",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/requests",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockAuth0Token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            requests: eachLike({
              id: like("req_001"),
              ticketNumber: like("F137-2024-001"),
              learnerName: like("Juan Dela Cruz"),
              learnerReferenceNumber: like("123456789012"),
              status: like("submitted"),
              submittedDate: like("2024-01-15T10:30:00Z"),
              estimatedCompletion: like("2024-01-22T17:00:00Z"),
              requestType: like("Original Copy"),
              deliveryMethod: like("pickup"),
              requesterName: like("Maria Dela Cruz"),
              requesterEmail: like("maria@email.com"),
              comments: eachLike({
                id: like("comment_001"),
                message: like("Your request has been received"),
                registrarName: like("Ms. Santos"),
                timestamp: like("2024-01-15T10:35:00Z"),
                type: like("info"),
                requiresResponse: like(false),
              }),
            }),
            statistics: {
              totalRequests: like(5),
              pendingRequests: like(2),
              completedRequests: like(3),
              averageProcessingTime: like(7),
            },
          },
        },
      })
    })

    it("should return dashboard data with Auth0 authentication", async () => {
      const dashboardAPI = new DashboardAPI("http://localhost:1234")
      const result = await dashboardAPI.getDashboardData(mockAuth0Token)

      expect(result.requests).toBeDefined()
      expect(result.stats).toBeDefined()
      expect(result.requests[0]).toHaveProperty("id")
      expect(result.requests[0]).toHaveProperty("ticketNumber")
      expect(result.requests[0]).toHaveProperty("status")
    })
  })

  describe("GET /api/dashboard/request/:id", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "request exists",
        uponReceiving: "a request for specific request details with Auth0 token",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/request/req_001",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockAuth0Token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            id: like("req_001"),
            ticketNumber: like("F137-2024-001"),
            learnerName: like("Juan Dela Cruz"),
            learnerReferenceNumber: like("123456789012"),
            status: like("submitted"),
            submittedDate: like("2024-01-15T10:30:00Z"),
            estimatedCompletion: like("2024-01-22T17:00:00Z"),
            requestType: like("Original Copy"),
            deliveryMethod: like("pickup"),
            requesterName: like("Maria Dela Cruz"),
            requesterEmail: like("maria@email.com"),
            comments: eachLike({
              id: like("comment_001"),
              message: like("Your request has been received"),
              registrarName: like("Ms. Santos"),
              timestamp: like("2024-01-15T10:35:00Z"),
              type: like("info"),
              requiresResponse: like(false),
            }),
          },
        },
      })
    })

    it("should return specific request details with Auth0 authentication", async () => {
      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      const dashboardAPI = new DashboardAPI("http://localhost:1234")
      const result = await dashboardAPI.getRequestDetails("req_001", mockAuth0Token)

      expect(result).toHaveProperty("id", "req_001")
      expect(result).toHaveProperty("ticketNumber")
      expect(result).toHaveProperty("status")
      expect(result.comments).toBeDefined()
    })
  })

  describe("POST /api/dashboard/request/:id/comment", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "request exists and accepts comments",
        uponReceiving: "a request to add a comment",
        withRequest: {
          method: "POST",
          path: "/api/dashboard/request/req_001/comment",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockAuth0Token}`,
          },
          body: {
            message: like("I need to update my contact information"),
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            id: like("comment_002"),
            message: like("I need to update my contact information"),
            author: like("Maria Dela Cruz"),
            timestamp: like("2024-01-16T14:30:00Z"),
            type: like("user-response"),
          },
        },
      })
    })

    it("should add a comment to the request", async () => {
      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      const dashboardAPI = new DashboardAPI("http://localhost:1234")
      const result = await dashboardAPI.addComment("req_001", "I need to update my contact information", mockAuth0Token)

      expect(result).toHaveProperty("id")
      expect(result).toHaveProperty("message", "I need to update my contact information")
      expect(result).toHaveProperty("type", "user-response")
    })
  })

  describe("PATCH /api/dashboard/request/:id/status", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "request exists and can be updated",
        uponReceiving: "a request to update request status",
        withRequest: {
          method: "PATCH",
          path: "/api/dashboard/request/req_001/status",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockAuth0Token}`,
          },
          body: {
            status: like("processing"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            id: like("req_001"),
            ticketNumber: like("F137-2024-001"),
            learnerName: like("Juan Dela Cruz"),
            learnerReferenceNumber: like("123456789012"),
            status: like("processing"),
            submittedDate: like("2024-01-15T10:30:00Z"),
            estimatedCompletion: like("2024-01-22T17:00:00Z"),
            requestType: like("Original Copy"),
            deliveryMethod: like("pickup"),
            requesterName: like("Maria Dela Cruz"),
            requesterEmail: like("maria@email.com"),
            comments: eachLike({
              id: like("comment_001"),
              message: like("Your request has been received"),
              registrarName: like("Ms. Santos"),
              timestamp: like("2024-01-15T10:35:00Z"),
              type: like("info"),
              requiresResponse: like(false),
            }),
          },
        },
      })
    })

    it("should update request status", async () => {
      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      const dashboardAPI = new DashboardAPI("http://localhost:1234")
      const result = await dashboardAPI.updateRequestStatus("req_001", "processing", mockAuth0Token)

      expect(result).toHaveProperty("id", "req_001")
      expect(result).toHaveProperty("status", "processing")
    })
  })

  describe("Error scenarios", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "request does not exist",
        uponReceiving: "a request for non-existent request",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/request/nonexistent",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockAuth0Token}`,
          },
        },
        willRespondWith: {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: like("Request not found"),
            code: like("REQUEST_NOT_FOUND"),
          },
        },
      })
    })

    it("should handle non-existent request", async () => {
      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      const dashboardAPI = new DashboardAPI("http://localhost:1234")

      await expect(dashboardAPI.getRequestDetails("nonexistent", mockAuth0Token)).rejects.toThrow("Request not found")
    })
  })
})
