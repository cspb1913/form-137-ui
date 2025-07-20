import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import AdminRequestDetail from "@/components/admin-request-detail"

// Mock the Auth0 hook
jest.mock("@auth0/nextjs-auth0", () => ({
  useUser: () => ({
    user: { email: "admin@test.com" },
    isLoading: false,
    error: undefined,
  }),
  getAccessToken: jest.fn().mockResolvedValue("mock-token"),
}))

// Mock the dashboard API service 
jest.mock("@/services/dashboard-api", () => ({
  dashboardApi: {
    getDashboardData: jest.fn().mockResolvedValue({
      requests: [
        {
          id: "1",
          ticketNumber: "REQ-2025-00001",
          studentName: "John Doe",
          studentId: "123456789012",
          email: "john@test.com",
          phoneNumber: "123-456-7890",
          graduationYear: "2025",
          program: "Computer Science",
          purpose: "Job Application",
          deliveryMethod: "email",
          status: "submitted",
          submittedAt: "2025-01-15T10:30:00Z",
          updatedAt: "2025-01-15T10:30:00Z",
          comments: [{ id: "1", message: "Initial submission", author: "System", createdAt: "2025-01-15T10:30:00Z" }],
          documents: []
        }
      ],
      stats: {
        totalRequests: 1,
        pendingRequests: 1,
        completedRequests: 0,
        rejectedRequests: 0
      }
    }),
    updateRequestStatus: jest.fn().mockResolvedValue({}),
    addComment: jest.fn().mockResolvedValue({}),
  },
}))

// Mock the toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("AdminRequestDetail", () => {
  it("renders request detail and allows status change", async () => {
    render(<AdminRequestDetail ticketNumber="REQ-2025-00001" />)
    
    // Should show loading initially
    expect(screen.getByText(/Loading request/)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText("Request REQ-2025-00001")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Initial submission")).toBeInTheDocument()
    })
    
    // Test save functionality
    fireEvent.click(screen.getByText(/Save Changes/))
    await waitFor(() => {
      expect(screen.getByText(/Saving/)).toBeInTheDocument()
    })
  })
})
