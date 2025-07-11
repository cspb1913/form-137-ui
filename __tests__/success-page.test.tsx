import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SuccessPage } from "@/components/success-page"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("SuccessPage Component", () => {
  const mockOnNewRequest = jest.fn()
  const ticketNumber = "REQ-2025-00123"

  beforeEach(() => {
    mockOnNewRequest.mockClear()
  })

  test("renders success message", () => {
    render(<SuccessPage ticketNumber={ticketNumber} onNewRequest={mockOnNewRequest} />)

    expect(screen.getByText("Request Submitted Successfully!")).toBeInTheDocument()
  })

  test("displays ticket number", () => {
    render(<SuccessPage ticketNumber={ticketNumber} onNewRequest={mockOnNewRequest} />)

    expect(screen.getByText(ticketNumber)).toBeInTheDocument()
  })

  test("shows next steps information", () => {
    render(<SuccessPage ticketNumber={ticketNumber} onNewRequest={mockOnNewRequest} />)

    expect(screen.getByText("What happens next?")).toBeInTheDocument()
    expect(screen.getByText("Email Confirmation")).toBeInTheDocument()
    expect(screen.getByText("Processing Time")).toBeInTheDocument()
    expect(screen.getByText("Status Updates")).toBeInTheDocument()
  })

  test("handles new request button click", async () => {
    const user = userEvent.setup()
    render(<SuccessPage ticketNumber={ticketNumber} onNewRequest={mockOnNewRequest} />)

    const newRequestButton = screen.getByRole("button", { name: /submit another request/i })
    await user.click(newRequestButton)

    expect(mockOnNewRequest).toHaveBeenCalledTimes(1)
  })

  test("displays processing time information", () => {
    render(<SuccessPage ticketNumber={ticketNumber} onNewRequest={mockOnNewRequest} />)

    expect(screen.getByText("Your Form 137 will be processed within 3-5 business days")).toBeInTheDocument()
  })

  test("shows reference number in contact information", () => {
    render(<SuccessPage ticketNumber={ticketNumber} onNewRequest={mockOnNewRequest} />)

    expect(
      screen.getByText(
        `For questions about your request, please contact us with your reference number: ${ticketNumber}`,
      ),
    ).toBeInTheDocument()
  })
})
