import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import AdminRequestDetail from "@/components/admin-request-detail"

// Mock fetch for detail and patch
const mockDetail = {
  ticketNumber: "T123",
  learnerReferenceNumber: "123456789012",
  requesterName: "John Doe",
  status: "submitted",
  submittedAt: new Date().toISOString(),
  comments: "Initial comment",
}

global.fetch = jest.fn((url, opts) => {
  if (opts && opts.method === "PATCH") {
    return Promise.resolve({ ok: true })
  }
  return Promise.resolve({
    json: () => Promise.resolve({ request: mockDetail }),
  })
}) as jest.Mock

describe("AdminRequestDetail", () => {
  it("renders request detail and allows status change", async () => {
    render(<AdminRequestDetail ticketNumber="T123" />)
    await waitFor(() => {
      expect(screen.getByText("Request T123")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Initial comment")).toBeInTheDocument()
    })
    // Change status
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "completed" } })
    fireEvent.click(screen.getByText(/Save Changes/))
    await waitFor(() => {
      expect(screen.getByText(/Saving/)).toBeInTheDocument()
    })
  })
})
