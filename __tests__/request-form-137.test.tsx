import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RequestForm137 } from "@/components/request-form-137"
import { jest } from "@jest/globals"

// Mock the toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock bot detection provider to avoid context errors
jest.mock("@/components/botid-provider")

describe("RequestForm137 Component", () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    mockOnSuccess.mockClear()
  })

  test("renders form title", () => {
    render(<RequestForm137 onSuccess={mockOnSuccess} />)
    expect(screen.getByText("Request Form 137 (Learner's Permanent Record)")).toBeInTheDocument()
  })

  test("renders all required form sections", () => {
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    expect(screen.getByText("Learner Information")).toBeInTheDocument()
    expect(screen.getByText("Academic Information")).toBeInTheDocument()
    expect(screen.getByText("Request Details")).toBeInTheDocument()
    expect(screen.getByText("Requester Information")).toBeInTheDocument()
  })

  test("shows validation errors on empty form submission", async () => {
    const user = userEvent.setup()
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    const submitButton = screen.getByRole("button", { name: /submit request/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Learner Reference Number is required")).toBeInTheDocument()
      expect(screen.getByText("First Name is required")).toBeInTheDocument()
      expect(screen.getByText("Last Name is required")).toBeInTheDocument()
    })
  })

  test("validates learner reference number format", async () => {
    const user = userEvent.setup()
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    const lrnInput = screen.getByPlaceholderText("e.g., 123456789012")
    await user.type(lrnInput, "12345")

    const submitButton = screen.getByRole("button", { name: /submit request/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Must be exactly 12 digits")).toBeInTheDocument()
    })
  })

  test("formats mobile number with +63 prefix", async () => {
    const user = userEvent.setup()
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    const mobileInput = screen.getByPlaceholderText("+639123456789")
    await user.clear(mobileInput)
    await user.type(mobileInput, "9123456789")

    expect(mobileInput).toHaveValue("+639123456789")
  })

  test("shows authorization letter field for non-self relationships", async () => {
    const user = userEvent.setup()
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    // Initially, authorization letter should not be visible
    expect(screen.queryByText("Upload Authorization Letter")).not.toBeInTheDocument()

    // Select Parent/Guardian relationship
    const relationshipSelect = screen.getByRole("combobox")
    await user.click(relationshipSelect)
    await user.click(screen.getByText("Parent/Guardian"))

    // Now authorization letter should be visible
    await waitFor(() => {
      expect(screen.getByText("Upload Authorization Letter")).toBeInTheDocument()
    })
  })

  test("restricts learner reference number to digits only", async () => {
    const user = userEvent.setup()
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    const lrnInput = screen.getByPlaceholderText("e.g., 123456789012")
    await user.type(lrnInput, "abc123def456")

    expect(lrnInput).toHaveValue("123456")
  })

  test("validates email format", async () => {
    const user = userEvent.setup()
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    const emailInput = screen.getByRole("textbox", { name: /email address/i })
    await user.type(emailInput, "invalid-email")

    const submitButton = screen.getByRole("button", { name: /submit request/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument()
    })
  })

  test("populates grade level options correctly", async () => {
    const user = userEvent.setup()
    render(<RequestForm137 onSuccess={mockOnSuccess} />)

    const gradeSelect = screen.getByRole("combobox")
    await user.click(gradeSelect)

    expect(screen.getByText("Grade 6")).toBeInTheDocument()
    expect(screen.getByText("Grade 12")).toBeInTheDocument()
  })
})
