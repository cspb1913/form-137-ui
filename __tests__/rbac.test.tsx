import { render, screen, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import HomePage from "@/app/page"
import AdminPage from "@/app/admin/page"
import UnauthorizedPage from "@/app/unauthorized/page"
import * as currentUserHook from "@/hooks/use-current-user"
import { jest } from "@jest/globals"

// Mock hooks and components
jest.mock("@/hooks/use-current-user")
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}))

// Mock Auth0 hooks used by AdminRequestList
jest.mock("@auth0/nextjs-auth0", () => ({
  useUser: jest.fn(() => ({
    user: { name: "Admin User", email: "admin@test.com" },
    isLoading: false,
    error: undefined,
  })),
  getAccessToken: jest.fn().mockResolvedValue("mock-token"),
}))

// Mock SWR to prevent network requests
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
  })),
}))

// Mock the services that make API calls
jest.mock("@/services/dashboard-api", () => ({
  getDashboardData: jest.fn(() => Promise.resolve({ stats: {} })),
  dashboardApi: {
    getDashboardData: jest.fn(() => Promise.resolve({
      requests: [
        {
          id: "1",
          ticketNumber: "REQ-2025-00001",
          studentName: "John Doe",
          studentId: "123456789012",
          email: "john@test.com",
          phoneNumber: "123-456-7890",
          graduationYear: "2025",
          program: "Computer Science",
          purpose: "Job Application",
          deliveryMethod: "email",
          status: "submitted",
          submittedAt: "2025-01-15T10:30:00Z",
          updatedAt: "2025-01-15T10:30:00Z",
          comments: [],
          documents: []
        }
      ],
      stats: {
        totalRequests: 1,
        pendingRequests: 1,
        completedRequests: 0,
        rejectedRequests: 0
      }
    })),
  },
}))

// Mock components that aren't critical for RBAC testing
jest.mock("@/components/dashboard", () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard Component</div>,
}))

jest.mock("@/components/admin-request-list", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-request-list">Admin Request List</div>,
}))

jest.mock("@/components/top-navigation", () => ({
  TopNavigation: () => <div data-testid="top-navigation">Top Navigation</div>,
}))

jest.mock("@/components/login-prompt", () => ({
  LoginPrompt: () => <div data-testid="login-prompt">Login Prompt</div>,
}))

jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

const mockUseCurrentUser = currentUserHook.useCurrentUser as jest.MockedFunction<typeof currentUserHook.useCurrentUser>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe("Role-Based Access Control", () => {
  let mockRouterPush: jest.MockedFunction<any>
  let mockRouterReplace: jest.MockedFunction<any>

  beforeEach(() => {
    mockRouterPush = jest.fn()
    mockRouterReplace = jest.fn()
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterReplace,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("HomePage (Dashboard)", () => {
    it("redirects admin users to /admin", async () => {
      const adminUser = {
        sub: "auth0|admin",
        name: "Admin User",
        email: "admin@example.com",
        roles: ["Admin"],
      }

      mockUseCurrentUser.mockReturnValue({
        user: adminUser,
        isLoading: false,
        isError: false,
      })

      render(<HomePage />)

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith("/admin")
      })
    })

    it("allows requester users to stay on dashboard", async () => {
      const requesterUser = {
        sub: "auth0|requester",
        name: "Requester User",
        email: "requester@example.com",
        roles: ["Requester"],
      }

      mockUseCurrentUser.mockReturnValue({
        user: requesterUser,
        isLoading: false,
        isError: false,
      })

      render(<HomePage />)

      // Should not redirect
      expect(mockRouterReplace).not.toHaveBeenCalled()
      expect(screen.getByTestId("dashboard")).toBeInTheDocument()
    })

    it("shows login prompt for unauthenticated users", () => {
      mockUseCurrentUser.mockReturnValue({
        user: null,
        isLoading: false,
        isError: false,
      })

      render(<HomePage />)

      expect(screen.getByTestId("login-prompt")).toBeInTheDocument()
      expect(screen.queryByTestId("dashboard")).not.toBeInTheDocument()
    })

    it("shows loading state while checking authentication", () => {
      mockUseCurrentUser.mockReturnValue({
        user: null,
        isLoading: true,
        isError: false,
      })

      render(<HomePage />)

      expect(screen.getByTestId("top-navigation")).toBeInTheDocument()
      expect(screen.queryByTestId("dashboard")).not.toBeInTheDocument()
      expect(screen.queryByTestId("login-prompt")).not.toBeInTheDocument()
    })

    it("handles users with no roles (defaults to redirecting)", async () => {
      const userWithoutRoles = {
        sub: "auth0|noroles",
        name: "No Roles User",
        email: "noroles@example.com",
        roles: [],
      }

      mockUseCurrentUser.mockReturnValue({
        user: userWithoutRoles,
        isLoading: false,
        isError: false,
      })

      render(<HomePage />)

      // Should show redirecting state since user has no valid roles
      expect(screen.getByText("Redirecting...")).toBeInTheDocument()
    })

    it("handles users with undefined roles", async () => {
      const userWithUndefinedRoles = {
        sub: "auth0|undefroles",
        name: "Undefined Roles User",
        email: "undefroles@example.com",
        // roles property is undefined
      }

      mockUseCurrentUser.mockReturnValue({
        user: userWithUndefinedRoles,
        isLoading: false,
        isError: false,
      })

      render(<HomePage />)

      // Should show redirecting state since user has no valid roles
      expect(screen.getByText("Redirecting...")).toBeInTheDocument()
    })
  })

  describe("AdminPage", () => {
    it("allows admin users to access admin page", async () => {
      const adminUser = {
        sub: "auth0|admin",
        name: "Admin User",
        email: "admin@example.com",
        roles: ["Admin"],
      }

      mockUseCurrentUser.mockReturnValue({
        user: adminUser,
        isLoading: false,
        isError: false,
      })

      render(<AdminPage />)

      await waitFor(() => {
        expect(screen.getByTestId("admin-request-list")).toBeInTheDocument()
      })
      expect(screen.getByText("Admin Requests")).toBeInTheDocument()
      expect(mockRouterReplace).not.toHaveBeenCalledWith("/unauthorized")
    })

    it("redirects requester users to unauthorized page", async () => {
      const requesterUser = {
        sub: "auth0|requester",
        name: "Requester User",
        email: "requester@example.com",
        roles: ["Requester"],
      }

      mockUseCurrentUser.mockReturnValue({
        user: requesterUser,
        isLoading: false,
        isError: false,
      })

      render(<AdminPage />)

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith("/unauthorized")
      })
    })

    it("redirects unauthenticated users to login", async () => {
      mockUseCurrentUser.mockReturnValue({
        user: null,
        isLoading: false,
        isError: false,
      })

      render(<AdminPage />)

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith("/api/auth/login")
      })
    })

    it("shows loading state while checking authentication", () => {
      mockUseCurrentUser.mockReturnValue({
        user: null,
        isLoading: true,
        isError: false,
      })

      render(<AdminPage />)

      // Should show loading state, not admin content
      expect(screen.queryByTestId("admin-request-list")).not.toBeInTheDocument()
    })
  })

  describe("UnauthorizedPage", () => {
    it("renders unauthorized message with correct content", () => {
      render(<UnauthorizedPage />)

      expect(screen.getByText("Access Denied")).toBeInTheDocument()
      expect(screen.getByText(/You are not authorized to access this page/)).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /return to dashboard/i })).toHaveAttribute("href", "/")
      expect(screen.getByRole("link", { name: /sign out/i })).toHaveAttribute("href", "/api/auth/logout")
    })
  })
})