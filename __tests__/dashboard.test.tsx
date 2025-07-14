import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Dashboard } from "@/components/dashboard"
import { RequestDetail } from "@/components/request-detail"
import { StatusBadge } from "@/components/status-badge"
import { useRouter } from "next/navigation"
import jest from "jest" // Import jest to declare it

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn((date, formatStr) => "2024-01-15 - 10:30 AM"),
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
}

describe("Dashboard Component", () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    jest.clearAllMocks()
  })

  it("renders dashboard with statistics", () => {
    render(<Dashboard />)

    expect(screen.getByText("Form 137 Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Total Requests")).toBeInTheDocument()
    expect(screen.getByText("Pending")).toBeInTheDocument()
    expect(screen.getByText("Completed")).toBeInTheDocument()
    expect(screen.getByText("Avg. Processing Time")).toBeInTheDocument()
  })

  it("displays request list", () => {
    render(<Dashboard />)

    // Check if requests are displayed
    expect(screen.getByText("F137-2024-001")).toBeInTheDocument()
    expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument()
    expect(screen.getByText("Maria Santos")).toBeInTheDocument()
  })

  it("filters requests by status", async () => {
    render(<Dashboard />)

    // Click on status filter
    const statusFilter = screen.getByText("All Status")
    fireEvent.click(statusFilter)

    // Select pending status
    const pendingOption = screen.getByText("Pending")
    fireEvent.click(pendingOption)

    // Should show only pending requests
    await waitFor(() => {
      expect(screen.queryByText("F137-2024-003")).not.toBeInTheDocument() // completed request
    })
  })

  it("searches requests by learner name", async () => {
    render(<Dashboard />)

    const searchInput = screen.getByPlaceholderText("Search by learner name or ticket number...")
    fireEvent.change(searchInput, { target: { value: "Juan" } })

    await waitFor(() => {
      expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument()
      expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument()
    })
  })

  it("navigates to request detail on row click", () => {
    render(<Dashboard />)

    const requestRow = screen.getByText("F137-2024-001").closest("tr")
    fireEvent.click(requestRow!)

    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/request/req_001")
  })
})

describe("RequestDetail Component", () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    jest.clearAllMocks()
  })

  it("renders request details", () => {
    render(<RequestDetail requestId="req_001" />)

    expect(screen.getByText("F137-2024-001")).toBeInTheDocument()
    expect(screen.getByText("Request Details")).toBeInTheDocument()
    expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument()
  })

  it("shows not found message for invalid request", () => {
    render(<RequestDetail requestId="invalid" />)

    expect(screen.getByText("Request not found")).toBeInTheDocument()
    expect(screen.getByText("The request you're looking for doesn't exist.")).toBeInTheDocument()
  })

  it("displays comments section", () => {
    render(<RequestDetail requestId="req_001" />)

    expect(screen.getByText("Updates & Comments")).toBeInTheDocument()
    expect(screen.getByText("Your request has been received and is being processed.")).toBeInTheDocument()
  })

  it("shows comment form for clarification needed status", () => {
    render(<RequestDetail requestId="req_002" />)

    expect(screen.getByText("Add Response")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Type your response here...")).toBeInTheDocument()
  })

  it("submits comment successfully", async () => {
    render(<RequestDetail requestId="req_002" />)

    const textarea = screen.getByPlaceholderText("Type your response here...")
    const submitButton = screen.getByText("Send Response")

    fireEvent.change(textarea, { target: { value: "Here is my response" } })
    fireEvent.click(submitButton)

    expect(submitButton).toHaveTextContent("Sending...")

    await waitFor(() => {
      expect(submitButton).toHaveTextContent("Send Response")
    })
  })

  it("navigates back to dashboard", () => {
    render(<RequestDetail requestId="req_001" />)

    const backButton = screen.getByText("Back to Dashboard")
    fireEvent.click(backButton)

    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard")
  })
})

describe("StatusBadge Component", () => {
  it("renders submitted status correctly", () => {
    render(<StatusBadge status="submitted" />)

    const badge = screen.getByText("Submitted")
    expect(badge).toHaveClass("bg-blue-100", "text-blue-800")
  })

  it("renders processing status correctly", () => {
    render(<StatusBadge status="processing" />)

    const badge = screen.getByText("Processing")
    expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800")
  })

  it("renders completed status correctly", () => {
    render(<StatusBadge status="completed" />)

    const badge = screen.getByText("Completed")
    expect(badge).toHaveClass("bg-green-100", "text-green-800")
  })

  it("renders requires-clarification status correctly", () => {
    render(<StatusBadge status="requires-clarification" />)

    const badge = screen.getByText("Requires Clarification")
    expect(badge).toHaveClass("bg-red-100", "text-red-800")
  })

  it("renders ready-for-pickup status correctly", () => {
    render(<StatusBadge status="ready-for-pickup" />)

    const badge = screen.getByText("Ready for Pickup")
    expect(badge).toHaveClass("bg-purple-100", "text-purple-800")
  })
})
