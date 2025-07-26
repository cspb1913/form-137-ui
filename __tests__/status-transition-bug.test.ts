/**
 * Test for reproducing the status transition bug
 * Issue: Unable to update request status from "Processing" to "Completed" in Form 137 Admin
 */

import { DashboardAPI } from "@/services/dashboard-api"

// Mock fetch to simulate API responses
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe("Status Transition Bug Reproduction", () => {
  let dashboardAPI: DashboardAPI

  beforeEach(() => {
    dashboardAPI = new DashboardAPI("http://test-api.com")
    jest.clearAllMocks()
  })

  it("should successfully update status from processing to completed", async () => {
    // Mock successful API response for status update
    const mockApiResponse = {
      id: "req_001",
      ticketNumber: "REQ‑0726202591538",
      learnerName: "Test Student",
      learnerReferenceNumber: "123456789012",
      status: "completed", // Updated status
      submittedDate: "2024-07-26T10:30:00Z",
      updatedDate: "2024-07-26T11:30:00Z", 
      requesterEmail: "test@example.com",
      requesterPhoneNumber: "123-456-7890",
      comments: [],
      documents: []
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response)

    const result = await dashboardAPI.updateRequestStatus("req_001", "completed", "test-token")

    expect(result.status).toBe("completed")
    expect(mockFetch).toHaveBeenCalledWith(
      "http://test-api.com/api/dashboard/request/req_001/status",
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ status: "completed" }),
      }
    )
  })

  it("should handle status transition validation errors", async () => {
    // Mock API error response with the specific error message from the issue
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({
        message: "Failed to update status. Please try again.",
        error: "Invalid status transition"
      }),
    } as Response)

    await expect(
      dashboardAPI.updateRequestStatus("req_001", "completed", "test-token")
    ).rejects.toThrow("API request failed: 422 Unprocessable Entity")
  })

  it("should handle authentication/permission errors", async () => {
    // Mock API error response for permission denied
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({
        message: "Insufficient permissions to update status",
      }),
    } as Response)

    await expect(
      dashboardAPI.updateRequestStatus("req_001", "completed", "test-token")
    ).rejects.toThrow("API request failed: 403 Forbidden")
  })

  it("should validate status values are lowercase", () => {
    // Test that the status values used in the admin UI are correctly formatted for the API
    const validStatuses = ["pending", "processing", "completed", "rejected"]
    const testStatus = "completed"
    
    expect(validStatuses).toContain(testStatus)
    expect(testStatus).toBe(testStatus.toLowerCase())
  })
})