import { render, screen, waitFor } from "@testing-library/react"
import AdminRequestList from "@/components/admin-request-list"

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
    getDashboardData: jest.fn(),
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
