import { Pact } from "@pact-foundation/pact"
import { like, eachLike } from "@pact-foundation/pact/src/dsl/matchers"
import { DashboardAPI } from "../../services/dashboard-api"

const provider = new Pact({
  consumer: "Form137Frontend",
  provider: "AdminAPI",
  port: 1236,
  log: "./logs/admin-pact.log",
  dir: "./pacts",
  logLevel: "INFO",
})

describe("Admin API Pact Tests", () => {
  beforeAll(() => provider.setup())
  afterEach(() => provider.verify())
  afterAll(() => provider.finalize())

  describe("GET /api/dashboard/requests - Admin Access", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "admin has access to all form 137 requests",
        uponReceiving: "a request for all requests from admin",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/requests",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer admin_token123"),
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
              ticketNumber: like("REQ-2025-00001"),
              learnerName: like("Juan Dela Cruz"),
              learnerReferenceNumber: like("123456789012"),
              status: like("submitted"),
              submittedDate: like("2025-01-15T10:30:00Z"),
              estimatedCompletion: like("2025-01-22T17:00:00Z"),
              requestType: like("Original Copy"),
              deliveryMethod: like("pickup"),
              requesterName: like("Maria Dela Cruz"),
              requesterEmail: like("maria@email.com"),
              comments: eachLike({
                id: like("comment_001"),
                message: like("Request received and being processed"),
                registrarName: like("Ms. Santos"),
                timestamp: like("2025-01-15T10:35:00Z"),
                type: like("info"),
                requiresResponse: like(false),
              }),
            }),
            statistics: {
              totalRequests: like(15),
              pendingRequests: like(5),
              completedRequests: like(8),
              rejectedRequests: like(2),
            },
          },
        },
      })
    })

    it("should return all requests for admin dashboard", async () => {
      const adminAPI = new DashboardAPI("http://localhost:1236")
      const result = await adminAPI.getDashboardData("admin_token123")

      expect(result.requests).toBeDefined()
      expect(result.stats).toBeDefined()
      expect(result.requests[0]).toHaveProperty("id")
      expect(result.requests[0]).toHaveProperty("ticketNumber")
      expect(result.requests[0]).toHaveProperty("status")
      expect(result.stats.totalRequests).toBeGreaterThan(0)
    })
  })
})