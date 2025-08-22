import { Pact } from "@pact-foundation/pact"
import { like, eachLike } from "@pact-foundation/pact/src/dsl/matchers"
import { DashboardAPI } from "../../services/dashboard-api"

/**
 * Admin API Pact Tests
 * 
 * This file contains pact consumer tests specifically for admin functionality.
 * Admin users have broader access compared to regular users - they can view all
 * form 137 requests across the system, not just their own submissions.
 * 
 * These tests validate that admin authentication tokens provide access to 
 * admin-level endpoints and return appropriate data structures.
 */

const provider = new Pact({
  consumer: "Form137Frontend",
  provider: "AdminAPI",
  port: 1236,
  log: "./logs/admin-pact.log",
  dir: "./pacts",
  logLevel: "INFO",
})

describe("Admin API Pact Tests", () => {
  const mockAuth0Token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5In0.eyJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tIiwiYXVkIjoiaHR0cHM6Ly9mb3JtMTM3LmNzcGIuZWR1LnBoL2FwaSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsInJvbGVzIjpbIkFkbWluIl19.fake-signature"
  beforeAll(() => provider.setup())
  afterEach(() => provider.verify())
  afterAll(() => provider.finalize())

  describe("GET /api/dashboard/requests - Admin Access", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "admin has access to all form 137 requests",
        uponReceiving: "a request for all requests from admin",
        withRequest: {
          method: "GET",
          path: "/api/dashboard/requests",
          headers: {
            Accept: "application/json",
            "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5In0.eyJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tIiwiYXVkIjoiaHR0cHM6Ly9mb3JtMTM3LmNzcGIuZWR1LnBoL2FwaSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsInJvbGVzIjpbIkFkbWluIl19.fake-signature",
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
      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const adminAPI = new DashboardAPI("http://localhost:1236")
      const result = await adminAPI.getDashboardData(mockAuth0Token)

      expect(result.requests).toBeDefined()
      expect(result.stats).toBeDefined()
      expect(result.requests[0]).toHaveProperty("id")
      expect(result.requests[0]).toHaveProperty("ticketNumber")
      expect(result.requests[0]).toHaveProperty("status")
      expect(result.stats.totalRequests).toBeGreaterThan(0)
    })
  })

  describe("PATCH /api/dashboard/request/:id/status - Admin Update", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "admin can update any request status",
        uponReceiving: "a request to update request status from admin",
        withRequest: {
          method: "PATCH",
          path: "/api/dashboard/request/req_001/status",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5In0.eyJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tIiwiYXVkIjoiaHR0cHM6Ly9mb3JtMTM3LmNzcGIuZWR1LnBoL2FwaSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsInJvbGVzIjpbIkFkbWluIl19.fake-signature",
          },
          body: {
            status: like("completed"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            id: like("req_001"),
            ticketNumber: like("REQ-2025-00001"),
            learnerName: like("Juan Dela Cruz"),
            learnerReferenceNumber: like("123456789012"),
            status: like("completed"),
            submittedDate: like("2025-01-15T10:30:00Z"),
            estimatedCompletion: like("2025-01-22T17:00:00Z"),
            requestType: like("Original Copy"),
            deliveryMethod: like("pickup"),
            requesterName: like("Maria Dela Cruz"),
            requesterEmail: like("maria@email.com"),
            comments: eachLike({
              id: like("comment_001"),
              message: like("Request completed and ready for pickup"),
              registrarName: like("Ms. Santos"),
              timestamp: like("2025-01-15T10:35:00Z"),
              type: like("info"),
              requiresResponse: like(false),
            }),
          },
        },
      })
    })

    it("should allow admin to update request status", async () => {
      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const adminAPI = new DashboardAPI("http://localhost:1236")
      const result = await adminAPI.updateRequestStatus("req_001", "completed", mockAuth0Token)

      expect(result).toHaveProperty("id", "req_001")
      expect(result).toHaveProperty("status", "completed")
    })
  })

  describe("POST /api/dashboard/request/:id/comment - Admin Comment", () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: "admin can add comments to any request",
        uponReceiving: "a request to add admin comment",
        withRequest: {
          method: "POST",
          path: "/api/dashboard/request/req_001/comment",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5In0.eyJpc3MiOiJodHRwczovL2phc29uY2FsYWxhbmcuYXV0aDAuY29tIiwiYXVkIjoiaHR0cHM6Ly9mb3JtMTM3LmNzcGIuZWR1LnBoL2FwaSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsInJvbGVzIjpbIkFkbWluIl19.fake-signature",
          },
          body: {
            message: like("Request has been processed and is ready for pickup"),
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            id: like("comment_002"),
            message: like("Request has been processed and is ready for pickup"),
            author: like("Ms. Santos"),
            createdAt: like("2025-01-16T14:30:00Z"),
          },
        },
      })
    })

    it("should allow admin to add comments", async () => {
      // Small delay to ensure interaction is registered
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const adminAPI = new DashboardAPI("http://localhost:1236")
      const result = await adminAPI.addComment("req_001", "Request has been processed and is ready for pickup", mockAuth0Token)

      expect(result).toHaveProperty("id")
      expect(result).toHaveProperty("message", "Request has been processed and is ready for pickup")
      expect(result).toHaveProperty("author", "Ms. Santos")
    })
  })
})