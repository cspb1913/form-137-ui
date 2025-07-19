import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SuccessPage } from "@/components/success-page"
import { jest } from "@jest/globals"

describe("SuccessPage Component", () => {
  const mockBack = jest.fn()
  const mockDashboard = jest.fn()
  const data = {
    ticketNumber: "REQ-2025-00123",
    learnerName: "Juan Dela Cruz",
    learnerReferenceNumber: "123456789012",
    requesterName: "Maria Cruz",
    requesterEmail: "maria@email.com",
    mobileNumber: "+639171234567",
    deliveryMethod: "email",
    estimatedCompletion: "2025-07-20",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders success information", () => {
    render(
      <SuccessPage
        submissionData={data}
        onBackToForm={mockBack}
        onGoToDashboard={mockDashboard}
      />,
    )

    expect(screen.getByText("Request Submitted Successfully!")).toBeInTheDocument()
    expect(screen.getByText(data.ticketNumber)).toBeInTheDocument()
    expect(screen.getByText(data.learnerName)).toBeInTheDocument()
  })

  test("triggers callbacks on buttons", async () => {
    const user = userEvent.setup()
    render(
      <SuccessPage
        submissionData={data}
        onBackToForm={mockBack}
        onGoToDashboard={mockDashboard}
      />,
    )

    await user.click(screen.getByRole("button", { name: /submit another request/i }))
    expect(mockBack).toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: /view dashboard/i }))
    expect(mockDashboard).toHaveBeenCalled()
  })
})
