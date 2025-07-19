import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import AdminRequestDetail from "@/components/admin-request-detail"

// Mock the useCurrentUser hook
jest.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    user: { email: "admin@test.com" },
    isLoading: false,
    isError: false,
  }),
}))

// Mock the dashboard API service 
jest.mock("@/services/dashboard-api", () => ({
  dashboardApi: {
    getRequestById: jest.fn(),
    updateRequestStatus: jest.fn(),
    addComment: jest.fn(),
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
