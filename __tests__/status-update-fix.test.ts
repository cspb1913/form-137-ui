/**
 * Test for status update fix
 * This verifies that updateRequestStatus correctly transforms the API response
 */

import { DashboardAPI } from "@/services/dashboard-api"

// Mock fetch to simulate API responses
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe("Status Update Fix", () => {
  let dashboardAPI: DashboardAPI

  beforeEach(() => {
    dashboardAPI = new DashboardAPI("http://test-api.com")
    jest.clearAllMocks()
  })

  it("should transform API response in updateRequestStatus", async () => {
    // Mock successful API response with raw format
    const mockApiResponse = {
      id: "req_001",
      ticketNumber: "F137-2024-001",
      learnerName: "John Doe", // Raw API field name
      learnerReferenceNumber: "123456789012", // Raw API field name
      status: "completed",
      submittedDate: "2024-01-15T10:30:00Z",
      updatedDate: "2024-01-15T11:30:00Z",
      requesterEmail: "john@example.com", // Raw API field name
      requesterPhoneNumber: "123-456-7890", // Raw API field name
      comments: [],
      documents: []
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response)

    const result = await dashboardAPI.updateRequestStatus("req_001", "completed", "test-token")

    // Verify the response is properly transformed
    expect(result).toEqual({
      id: "req_001",
      ticketNumber: "F137-2024-001",
      studentName: "John Doe", // Transformed field name
      studentId: "123456789012", // Transformed field name
      status: "completed",
      submittedAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T11:30:00Z",
      email: "john@example.com", // Transformed field name
      phoneNumber: "123-456-7890", // Transformed field name
      graduationYear: "",
      program: "",
      purpose: "",
      deliveryMethod: "",
      deliveryAddress: undefined,
      comments: [],
      documents: []
    })

    // Verify the API was called with correct parameters
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

  it("should handle API errors properly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
    } as Response)

    await expect(
      dashboardAPI.updateRequestStatus("req_001", "completed", "test-token")
    ).rejects.toThrow("API request failed: 422 Unprocessable Entity")
  })
})