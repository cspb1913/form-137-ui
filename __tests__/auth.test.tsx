import { render, screen } from "@testing-library/react"
import { useUser } from "@auth0/nextjs-auth0"
import { LoginPrompt } from "@/components/login-prompt"
import { TopNavigation } from "@/components/top-navigation"
import jest from "jest" // Declare the jest variable

// Mock Auth0
jest.mock("@auth0/nextjs-auth0", () => ({
  useUser: jest.fn(),
}))

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
  }),
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
      expect(screen.getByText("Learner's Permanent Record Request System")).toBeInTheDocument()
      expect(screen.getByText("Welcome Back")).toBeInTheDocument()
      expect(screen.getByText("Sign In to Continue")).toBeInTheDocument()
      expect(screen.getByText("Secure authentication with Auth0")).toBeInTheDocument()
    })

    it("has correct login link", () => {
      render(<LoginPrompt />)

      const loginButton = screen.getByRole("link", { name: /sign in to continue/i })
      expect(loginButton).toHaveAttribute("href", "/api/auth/login")
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

      expect(screen.getByText("Login")).toBeInTheDocument()
      const loginLink = screen.getByRole("link", { name: /login/i })
      expect(loginLink).toHaveAttribute("href", "/api/auth/login")
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

      // Should not show login button
      expect(screen.queryByText("Login")).not.toBeInTheDocument()

      // Should show user avatar (button with user's initial)
      expect(screen.getByText("J")).toBeInTheDocument()
    })

    it("shows navigation items correctly", () => {
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
})
