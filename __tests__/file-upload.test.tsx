import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FileUpload } from "@/components/file-upload"
import jest from "jest"

describe("FileUpload Component", () => {
  const mockOnFileSelect = jest.fn()

  const defaultProps = {
    label: "Test File Upload",
    accept: ".pdf,.jpg,.png",
    maxSize: 5 * 1024 * 1024,
    onFileSelect: mockOnFileSelect,
  }

  beforeEach(() => {
    mockOnFileSelect.mockClear()
  })

  test("renders file upload component", () => {
    render(<FileUpload {...defaultProps} />)
    expect(screen.getByText("Test File Upload")).toBeInTheDocument()
    expect(screen.getByText("Choose File")).toBeInTheDocument()
  })

  test("shows required asterisk when required", () => {
    render(<FileUpload {...defaultProps} required />)
    expect(screen.getByText("*")).toBeInTheDocument()
  })

  test("displays error message", () => {
    const error = "File is required"
    render(<FileUpload {...defaultProps} error={error} />)
    expect(screen.getByText(error)).toBeInTheDocument()
  })

  test("handles file selection", async () => {
    const user = userEvent.setup()
    render(<FileUpload {...defaultProps} />)

    const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
    const input = screen
      .getByRole("button", { name: /choose file/i })
      .parentElement?.querySelector('input[type="file"]')

    if (input) {
      await user.upload(input, file)
      expect(mockOnFileSelect).toHaveBeenCalledWith(file)
    }
  })

  test("displays selected file information", () => {
    const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
    render(<FileUpload {...defaultProps} file={file} />)

    expect(screen.getByText("test.pdf")).toBeInTheDocument()
  })

  test("handles file removal", async () => {
    const user = userEvent.setup()
    const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
    render(<FileUpload {...defaultProps} file={file} />)

    const removeButton = screen.getByRole("button")
    await user.click(removeButton)

    expect(mockOnFileSelect).toHaveBeenCalledWith(null)
  })

  test("handles drag and drop", async () => {
    render(<FileUpload {...defaultProps} />)

    const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
    const dropZone = screen.getByText("or drag and drop").closest("div")

    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      })

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file)
      })
    }
  })
})
