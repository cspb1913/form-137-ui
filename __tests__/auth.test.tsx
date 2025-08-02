import { render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import * as currentUserHook from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import { LoginPrompt } from "@/components/login-prompt"
import { TopNavigation } from "@/components/top-navigation"
import { jest } from "@jest/globals"

// Mock our custom user hook
jest.mock("@/hooks/use-current-user")

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}))

const mockUseCurrentUser = currentUserHook.useCurrentUser as jest.MockedFunction<typeof currentUserHook.useCurrentUser>
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
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument()
    })

    it("shows requester navigation when authenticated as requester", () => {
      const mockUser = {
        sub: "auth0|123",
        name: "John Doe",
        email: "john@example.com",
        picture: "https://example.com/avatar.jpg",
        roles: ["Requester"],
      }
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isError: false,
      })
      render(<TopNavigation />)
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("New Request")).toBeInTheDocument()
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument()
      expect(screen.queryByText("Log in")).not.toBeInTheDocument()
    })

    it("shows admin navigation when authenticated as admin", () => {
      const mockUser = {
        sub: "auth0|456",
        name: "Jane Admin",
        email: "admin@example.com",
        picture: "https://example.com/admin-avatar.jpg",
        roles: ["Admin"],
      }
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isError: false,
      })
      render(<TopNavigation />)
      expect(screen.getByText("Admin Panel")).toBeInTheDocument()
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
      expect(screen.queryByText("New Request")).not.toBeInTheDocument()
      expect(screen.queryByText("Log in")).not.toBeInTheDocument()
    })

    it("displays user roles in dropdown menu when opened", async () => {
      const user = userEvent.setup()
      const mockUser = {
        sub: "auth0|789",
        name: "Multi Role User",
        email: "multi@example.com",
        picture: "https://example.com/multi-avatar.jpg",
        roles: ["Admin", "Requester"],
      }
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isError: false,
      })
      render(<TopNavigation />)
      
      // Open the dropdown menu by clicking the avatar
      const avatarButton = screen.getByRole("button", { expanded: false })
      await user.click(avatarButton)
      
      // Check that the roles are displayed in the dropdown
      expect(screen.getByText("Role: Admin, Requester")).toBeInTheDocument()
    })

    it("displays no roles message when user has no roles", async () => {
      const user = userEvent.setup()
      const mockUser = {
        sub: "auth0|noRoles",
        name: "No Roles User",
        email: "noroles@example.com",
        picture: "https://example.com/noroles-avatar.jpg",
        roles: [],
      }
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isError: false,
      })
      render(<TopNavigation />)
      
      // Open the dropdown menu by clicking the avatar
      const avatarButton = screen.getByRole("button", { expanded: false })
      await user.click(avatarButton)
      
      // Check that the no roles message is displayed in the dropdown
      expect(screen.getByText("No roles assigned")).toBeInTheDocument()
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
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument()
    })
  })
})
