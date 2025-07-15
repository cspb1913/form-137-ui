import { render, screen } from "@testing-library/react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { TopNavigation } from "@/components/top-navigation"
import HomePage from "@/app/page"
import jest from "jest" // Declare the jest variable

// Mock the useUser hook
jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: jest.fn(),
}))

const mockUseUser = useUser as jest.Mock

describe("Authentication Components", () => {
  describe("TopNavigation", () => {
    it("shows Login button when user is not authenticated", () => {
      mockUseUser.mockReturnValue({ user: null, isLoading: false })
      render(<TopNavigation />)
      expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument()
    })

    it("shows user avatar when user is authenticated", () => {
      const mockUser = {
        name: "John Doe",
        email: "john.doe@example.com",
        picture: "https://example.com/avatar.jpg",
      }
      mockUseUser.mockReturnValue({ user: mockUser, isLoading: false })
      render(<TopNavigation />)
      expect(screen.getByRole("img", { name: /john doe/i })).toBeInTheDocument()
      expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument()
    })
  })

  describe("HomePage", () => {
    it('renders "Login to Get Started" button for logged-out users', () => {
      mockUseUser.mockReturnValue({ user: null, isLoading: false })
      render(<HomePage />)
      expect(screen.getByRole("link", { name: /login to get started/i })).toBeInTheDocument()
    })

    it('renders "Go to Dashboard" button for logged-in users', () => {
      const mockUser = { name: "Jane Doe" }
      mockUseUser.mockReturnValue({ user: mockUser, isLoading: false })
      render(<HomePage />)
      expect(screen.getByRole("link", { name: /go to dashboard/i })).toBeInTheDocument()
    })
  })
})
