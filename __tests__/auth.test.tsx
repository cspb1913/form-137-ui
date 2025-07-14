import { render, screen } from "@testing-library/react"
import { TopNavigation } from "@/components/top-navigation"
import { LoginPrompt } from "@/components/login-prompt"
import { useUser } from "@auth0/nextjs-auth0/client"
import { jest } from "@jest/globals" // Declare the jest variable

// Mock the useUser hook
jest.mock("@auth0/nextjs-auth0/client")
const mockUseUser = useUser as jest.Mock

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

describe("Authentication Components", () => {
  describe("LoginPrompt", () => {
    it("renders correctly with login button", () => {
      render(<LoginPrompt />)
      expect(screen.getByText("Authentication Required")).toBeInTheDocument()
      const loginLink = screen.getByRole("link", { name: /Log In with Auth0/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute("href", "/api/auth/login")
    })
  })

  describe("TopNavigation", () => {
    it("shows a loading skeleton while checking auth state", () => {
      mockUseUser.mockReturnValue({ user: null, isLoading: true })
      render(<TopNavigation />)
      expect(screen.getByRole("status")).toBeInTheDocument() // Skeleton has role="status"
    })

    it("shows Login button when user is not authenticated", () => {
      mockUseUser.mockReturnValue({ user: null, isLoading: false })
      render(<TopNavigation />)
      const loginLink = screen.getByRole("link", { name: /Login/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute("href", "/api/auth/login")
    })

    it("shows user profile dropdown when user is authenticated", () => {
      const mockUser = {
        name: "Jason Calalang",
        email: "jason.calalang@example.com",
        picture: "https://example.com/avatar.png",
      }
      mockUseUser.mockReturnValue({ user: mockUser, isLoading: false })
      render(<TopNavigation />)

      const avatar = screen.getByRole("button")
      expect(avatar).toBeInTheDocument()
      // Check for avatar image alt text
      expect(screen.getByAltText("User avatar")).toBeInTheDocument()
    })
  })
})
