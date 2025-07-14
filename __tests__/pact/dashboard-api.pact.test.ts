import { Pact } from "@pact-foundation/pact"
import { like, eachLike } from "@pact-foundation/pact/src/dsl/matchers"
import { DashboardAPI } from "../../services/dashboard-api"

const provider = new Pact({
  consumer: "Form137Frontend",
  provider: "DashboardAPI",
  port: 1234,
  log: "./logs/pact.log",
  dir: "./pacts",
  logLevel: "INFO",
})

describe("Dashboard API Pact Tests", () => {
  beforeAll(() => provider.setup())
  afterEach(() => provider.verify())
  afterAll(() => provider.finalize())

  describe("GET /api/dashboard/requests", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user has form 137 requests",
        uponReceiving: "a request for dashboard data",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/requests",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer token123"),
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

    it("should return dashboard data", async () => {
      const dashboardAPI = new DashboardAPI("http://localhost:1234")
      const result = await dashboardAPI.getDashboardData("token123")

      expect(result.requests).toBeDefined()
      expect(result.statistics).toBeDefined()
      expect(result.requests[0]).toHaveProperty("id")
      expect(result.requests[0]).toHaveProperty("ticketNumber")
      expect(result.requests[0]).toHaveProperty("status")
    })
  })

  describe("GET /api/dashboard/request/:id", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "request exists",
        uponReceiving: "a request for specific request details",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/request/req_001",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer token123"),
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

    it("should return specific request details", async () => {
      const dashboardAPI = new DashboardAPI("http://localhost:1234")
      const result = await dashboardAPI.getRequestDetails("req_001", "token123")

      expect(result).toHaveProperty("id", "req_001")
      expect(result).toHaveProperty("ticketNumber")
      expect(result).toHaveProperty("status")
      expect(result.comments).toBeDefined()
    })
  })

  describe("POST /api/dashboard/request/:id/comment", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "request exists and accepts comments",
        uponReceiving: "a request to add a comment",
        withRequest: {
          method: "POST",
          path: "/api/dashboard/request/req_001/comment",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: like("Bearer token123"),
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
      const dashboardAPI = new DashboardAPI("http://localhost:1234")
      const result = await dashboardAPI.addComment("req_001", "I need to update my contact information", "token123")

      expect(result).toHaveProperty("id")
      expect(result).toHaveProperty("message", "I need to update my contact information")
      expect(result).toHaveProperty("type", "user-response")
    })
  })

  describe("Error scenarios", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "request does not exist",
        uponReceiving: "a request for non-existent request",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/request/nonexistent",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer token123"),
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
      const dashboardAPI = new DashboardAPI("http://localhost:1234")

      await expect(dashboardAPI.getRequestDetails("nonexistent", "token123")).rejects.toThrow("Request not found")
    })
  })
})
