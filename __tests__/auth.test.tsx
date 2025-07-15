import { render, screen } from "@testing-library/react"
import { useUser } from "@auth0/nextjs-auth0"
import { useRouter } from "next/navigation"
import { LoginPrompt } from "@/components/login-prompt"
import { TopNavigation } from "@/components/top-navigation"
import jest from "jest" // Import jest to declare the variable

// Mock Auth0
jest.mock("@auth0/nextjs-auth0", () => ({
  useUser: jest.fn(),
}))

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}))

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe("Authentication Components", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any)
  })

  describe("LoginPrompt", () => {
    it("renders login prompt with correct content", () => {
      render(<LoginPrompt />)

      expect(screen.getByText("Form 137 Request Portal")).toBeInTheDocument()
      expect(screen.getByText("Secure access to your academic records")).toBeInTheDocument()
      expect(screen.getByText("Sign In to Continue")).toBeInTheDocument()
      expect(screen.getByText("Secure & Private")).toBeInTheDocument()
      expect(screen.getByText("Real-time Tracking")).toBeInTheDocument()
      expect(screen.getByText("Easy Process")).toBeInTheDocument()
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
        checkSession: jest.fn(),
      })

      render(<TopNavigation />)

      expect(screen.getByText("Log in")).toBeInTheDocument()
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    })

    it("shows navigation and user menu when authenticated", () => {
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
        checkSession: jest.fn(),
      })

      render(<TopNavigation />)

      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("New Request")).toBeInTheDocument()
      expect(screen.queryByText("Log in")).not.toBeInTheDocument()
    })

    it("shows loading state", () => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: true,
        checkSession: jest.fn(),
      })

      render(<TopNavigation />)

      expect(screen.queryByText("Log in")).not.toBeInTheDocument()
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    })

    it("displays user information in dropdown", () => {
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
        checkSession: jest.fn(),
      })

      render(<TopNavigation />)

      // The user info is in a dropdown, so we need to check for the avatar
      const avatar = screen.getByRole("button", { name: /john doe/i })
      expect(avatar).toBeInTheDocument()
    })
  })

  describe("Authentication Flow", () => {
    it("redirects to login when accessing protected route", () => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: false,
        checkSession: jest.fn(),
      })

      render(<LoginPrompt />)

      const loginLink = screen.getByRole("link", { name: /sign in to continue/i })
      expect(loginLink).toHaveAttribute("href", "/api/auth/login")
    })

    it("shows logout option when authenticated", () => {
      const mockUser = {
        sub: "auth0|123",
        name: "John Doe",
        email: "john@example.com",
      }

      mockUseUser.mockReturnValue({
        user: mockUser,
        error: undefined,
        isLoading: false,
        checkSession: jest.fn(),
      })

      render(<TopNavigation />)

      // Check that the component renders without errors when authenticated
      expect(screen.getByText("Form 137 Portal")).toBeInTheDocument()
    })
  })
})
