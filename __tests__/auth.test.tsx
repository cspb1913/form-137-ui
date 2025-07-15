import { render, screen } from "@testing-library/react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { LoginPrompt } from "@/components/login-prompt"
import { TopNavigation } from "@/components/top-navigation"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: jest.fn(),
}))

// Mock Next.js router
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

describe("Authentication Components", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("LoginPrompt", () => {
    it("renders login prompt with correct elements", () => {
      render(<LoginPrompt />)

      expect(screen.getByText("Form 137 Portal")).toBeInTheDocument()
      expect(screen.getByText("Please sign in to access your Form 137 requests and dashboard")).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/api/auth/login")
    })

    it("displays Auth0 branding", () => {
      render(<LoginPrompt />)

      expect(screen.getByText("Secure authentication powered by Auth0")).toBeInTheDocument()
    })
  })

  describe("TopNavigation", () => {
    it("shows login button when user is not authenticated", () => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: false,
      })

      render(<TopNavigation />)

      expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute("href", "/api/auth/login")
    })

    it("shows loading skeleton when authentication is loading", () => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: true,
      })

      render(<TopNavigation />)

      // Check for skeleton loading state
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument()
    })

    it("shows user dropdown when authenticated", () => {
      const mockUser = {
        sub: "auth0|123",
        name: "John Doe",
        email: "john@example.com",
        picture: "https://example.com/avatar.jpg",
      }

      mockUseUser.mockReturnValue({
        user: mockUser,
        error: undefined,
        isLoading: false,
      })

      render(<TopNavigation />)

      // Should show user avatar/dropdown trigger
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("displays navigation items correctly", () => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: false,
      })

      render(<TopNavigation />)

      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("New Request")).toBeInTheDocument()
      expect(screen.getByText("Form 137 Portal")).toBeInTheDocument()
    })
  })

  describe("Authentication Flow", () => {
    it("redirects to login when accessing protected routes", () => {
      // This would be tested in integration tests
      // Here we just verify the login link is correct
      render(<LoginPrompt />)

      const loginLink = screen.getByRole("link", { name: /sign in/i })
      expect(loginLink).toHaveAttribute("href", "/api/auth/login")
    })
  })
})
