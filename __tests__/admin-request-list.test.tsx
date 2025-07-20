import { render, screen, waitFor } from "@testing-library/react"
import AdminRequestList from "@/components/admin-request-list"

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
          comments: [],
          documents: []
        },
        {
          id: "2", 
          ticketNumber: "REQ-2025-00002",
          studentName: "Jane Smith",
          studentId: "234567890123",
          email: "jane@test.com",
          phoneNumber: "123-456-7891",
          graduationYear: "2025",
          program: "Engineering",
          purpose: "Graduate School",
          deliveryMethod: "pickup",
          status: "processing",
          submittedAt: "2025-01-14T14:20:00Z",
          updatedAt: "2025-01-14T14:20:00Z",
          comments: [],
          documents: []
        },
        {
          id: "3",
          ticketNumber: "REQ-2025-00003", 
          studentName: "Bob Johnson",
          studentId: "345678901234",
          email: "bob@test.com",
          phoneNumber: "123-456-7892",
          graduationYear: "2024",
          program: "Business",
          purpose: "Employment",
          deliveryMethod: "mail",
          status: "completed",
          submittedAt: "2025-01-13T09:15:00Z",
          updatedAt: "2025-01-13T09:15:00Z",
          comments: [],
          documents: []
        },
        {
          id: "4",
          ticketNumber: "REQ-2025-00004",
          studentName: "Alice Brown", 
          studentId: "456789012345",
          email: "alice@test.com",
          phoneNumber: "123-456-7893",
          graduationYear: "2024",
          program: "Arts",
          purpose: "Transfer",
          deliveryMethod: "email",
          status: "rejected",
          submittedAt: "2025-01-12T16:45:00Z",
          updatedAt: "2025-01-12T16:45:00Z",
          comments: [],
          documents: []
        }
      ],
      stats: {
        totalRequests: 4,
        pendingRequests: 1,
        completedRequests: 1,
        rejectedRequests: 1
      }
    }),
  },
}))

describe("AdminRequestList", () => {
  it("renders requests with mock data", async () => {
    render(<AdminRequestList />)
    
    // Should show loading initially
    expect(screen.getByText(/Loading requests/)).toBeInTheDocument()
    
    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText("REQ-2025-00001")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByTestId("admin-request-row-REQ-2025-00001")).toBeInTheDocument()
    })
  })

  it("shows loading then displays requests", async () => {
    render(<AdminRequestList />)
    
    // Should show loading initially
    expect(screen.getByText(/Loading requests/)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText("REQ-2025-00001")).toBeInTheDocument()
      expect(screen.getByText("REQ-2025-00002")).toBeInTheDocument()
      expect(screen.getByText("REQ-2025-00003")).toBeInTheDocument()
      expect(screen.getByText("REQ-2025-00004")).toBeInTheDocument()
    })
  })
})
