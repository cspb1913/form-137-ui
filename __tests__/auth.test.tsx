import { render, screen } from "@testing-library/react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import { LoginPrompt } from "@/components/login-prompt"
import { TopNavigation } from "@/components/top-navigation"
import { jest } from "@jest/globals"

// Mock our custom user hook
jest.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: jest.fn(),
}))

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}))

const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>
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
    })

    it("has correct login link", () => {
      render(<LoginPrompt />)
      const loginButton = screen.getByRole("link", { name: /sign in to continue/i })
      expect(loginButton).toHaveAttribute("href", "/api/auth/login")
    })
  })

  describe("TopNavigation", () => {
    it("shows login button when user is not authenticated", () => {
      mockUseCurrentUser.mockReturnValue({
        user: undefined,
        isLoading: false,
        isError: false,
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
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isError: false,
      })
      render(<TopNavigation />)
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("New Request")).toBeInTheDocument()
      expect(screen.queryByText("Log in")).not.toBeInTheDocument()
    })

    it("shows loading state", () => {
      mockUseCurrentUser.mockReturnValue({
        user: undefined,
        isLoading: true,
        isError: false,
      })
      render(<TopNavigation />)
      expect(screen.queryByText("Log in")).not.toBeInTheDocument()
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    })
  })
})
