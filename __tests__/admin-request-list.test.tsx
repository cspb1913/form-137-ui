import { render, screen, waitFor } from "@testing-library/react"
import AdminRequestList from "@/components/admin-request-list"

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      requests: [
        {
          ticketNumber: "T123",
          learnerReferenceNumber: "123456789012",
          requesterName: "John Doe",
          status: "submitted",
          submittedAt: new Date().toISOString(),
        },
      ],
    }),
  })
) as jest.Mock

describe("AdminRequestList", () => {
  it("renders requests from API", async () => {
    render(<AdminRequestList />)
    await waitFor(() => {
      expect(screen.getByText("T123")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByTestId("admin-request-row-T123")).toBeInTheDocument()
    })
  })

  it("shows loading then no requests", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve({ requests: [] }) })
    )
    render(<AdminRequestList />)
    expect(screen.getByText(/Loading requests/)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/No requests found/)).toBeInTheDocument()
    })
  })
})
