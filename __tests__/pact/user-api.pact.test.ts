import { Pact } from "@pact-foundation/pact"
import { like, eachLike } from "@pact-foundation/pact/src/dsl/matchers"
import { UserAPI } from "../../services/user-api"

const provider = new Pact({
  consumer: "Form137Frontend",
  provider: "UserAPI",
  port: 1235,
  log: "./logs/user-pact.log",
  dir: "./pacts",
  logLevel: "INFO",
})

describe("User API Pact Tests", () => {
  beforeAll(() => provider.setup())
  afterEach(() => provider.verify())
  afterAll(() => provider.finalize())

  describe("GET /api/users/me", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user is authenticated",
        uponReceiving: "a request for current user info",
        withRequest: {
          method: "GET",
          path: "/api/users/me",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer token123"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            auth0Id: like("auth0|687515def8dcc9049a9c9b57"),
            email: like("jason@cspb.edu.ph"),
            name: like("Jason Calalang"),
            roles: eachLike("Admin"),
            isActive: like(true),
            profile: {
              firstName: like("Jason"),
              lastName: like("Calalang"),
            },
            preferences: {
              emailNotifications: like(true),
              theme: like("light"),
            },
            metadata: {
              createdAt: like("2025-08-19T10:00:00Z"),
              updatedAt: like("2025-08-19T10:00:00Z"),
              lastLoginAt: like("2025-08-19T10:30:00Z"),
            },
          },
        },
      })
    })

    it("should return current user information", async () => {
      // Set up environment for custom token generation
      const originalApiUrl = process.env.NEXT_PUBLIC_FORM137_API_URL
      const originalSecret = process.env.NEXT_PUBLIC_CSPB_API_SECRET
      process.env.NEXT_PUBLIC_FORM137_API_URL = "http://localhost:1235"
      process.env.NEXT_PUBLIC_CSPB_API_SECRET = "test-secret-key-for-pact-tests"

      try {
        const userAPI = new UserAPI("http://localhost:1235")
        const result = await userAPI.getCurrentUser("token123")

        expect(result).toHaveProperty("auth0Id")
        expect(result).toHaveProperty("email")
        expect(result).toHaveProperty("name")
        expect(result).toHaveProperty("roles")
        expect(result.roles).toBeInstanceOf(Array)
        expect(result).toHaveProperty("isActive", true)
        expect(result.profile).toHaveProperty("firstName")
        expect(result.profile).toHaveProperty("lastName")
        expect(result.preferences).toHaveProperty("emailNotifications")
        expect(result.metadata).toHaveProperty("createdAt")
      } finally {
        process.env.NEXT_PUBLIC_FORM137_API_URL = originalApiUrl
        process.env.NEXT_PUBLIC_CSPB_API_SECRET = originalSecret
      }
    })
  })

  describe("GET /api/users/:auth0Id", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user exists",
        uponReceiving: "a request for specific user by auth0Id",
        withRequest: {
          method: "GET",
          path: "/api/users/auth0%7C687515def8dcc9049a9c9b57",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer token123"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            auth0Id: like("auth0|687515def8dcc9049a9c9b57"),
            email: like("jason@cspb.edu.ph"),
            name: like("Jason Calalang"),
            roles: eachLike("Admin"),
            isActive: like(true),
            profile: {
              firstName: like("Jason"),
              lastName: like("Calalang"),
            },
            preferences: {
              emailNotifications: like(true),
              theme: like("light"),
            },
            metadata: {
              createdAt: like("2025-08-19T10:00:00Z"),
              updatedAt: like("2025-08-19T10:00:00Z"),
              lastLoginAt: like("2025-08-19T10:30:00Z"),
            },
          },
        },
      })
    })

    it("should return user by auth0Id", async () => {
      const userAPI = new UserAPI("http://localhost:1235")
      const result = await userAPI.getUserByAuth0Id("auth0|687515def8dcc9049a9c9b57", "token123")

      expect(result).toHaveProperty("auth0Id", "auth0|687515def8dcc9049a9c9b57")
      expect(result).toHaveProperty("email", "jason@cspb.edu.ph")
      expect(result).toHaveProperty("roles")
      expect(result.roles).toBeInstanceOf(Array)
    })
  })

  describe("GET /api/users", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "users exist and requester is admin",
        uponReceiving: "a request for all users",
        withRequest: {
          method: "GET",
          path: "/api/users",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer admin-token123"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: eachLike({
            auth0Id: like("auth0|687515def8dcc9049a9c9b57"),
            email: like("jason@cspb.edu.ph"),
            name: like("Jason Calalang"),
            roles: eachLike("Admin"),
            isActive: like(true),
            profile: {
              firstName: like("Jason"),
              lastName: like("Calalang"),
            },
            preferences: {
              emailNotifications: like(true),
              theme: like("light"),
            },
            metadata: {
              createdAt: like("2025-08-19T10:00:00Z"),
              updatedAt: like("2025-08-19T10:00:00Z"),
              lastLoginAt: like("2025-08-19T10:30:00Z"),
            },
          }),
        },
      })
    })

    it("should return all users (admin only)", async () => {
      const userAPI = new UserAPI("http://localhost:1235")
      const result = await userAPI.getAllUsers("admin-token123")

      expect(result).toBeInstanceOf(Array)
      expect(result[0]).toHaveProperty("auth0Id")
      expect(result[0]).toHaveProperty("email")
      expect(result[0]).toHaveProperty("roles")
    })
  })

  describe("POST /api/users", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "admin can create users",
        uponReceiving: "a request to create a new user",
        withRequest: {
          method: "POST",
          path: "/api/users",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: like("Bearer admin-token123"),
          },
          body: {
            auth0Id: like("auth0|new-user-123"),
            email: like("newuser@cspb.edu.ph"),
            name: like("New User"),
            roles: eachLike("Requester"),
            profile: {
              firstName: like("New"),
              lastName: like("User"),
            },
            preferences: {
              emailNotifications: like(true),
              theme: like("light"),
            },
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            auth0Id: like("auth0|new-user-123"),
            email: like("newuser@cspb.edu.ph"),
            name: like("New User"),
            roles: eachLike("Requester"),
            isActive: like(true),
            profile: {
              firstName: like("New"),
              lastName: like("User"),
            },
            preferences: {
              emailNotifications: like(true),
              theme: like("light"),
            },
            metadata: {
              createdAt: like("2025-08-19T10:00:00Z"),
              updatedAt: like("2025-08-19T10:00:00Z"),
              lastLoginAt: null,
            },
          },
        },
      })
    })

    it("should create a new user", async () => {
      const userAPI = new UserAPI("http://localhost:1235")
      const newUser = {
        auth0Id: "auth0|new-user-123",
        email: "newuser@cspb.edu.ph",
        name: "New User",
        roles: ["Requester"],
        profile: {
          firstName: "New",
          lastName: "User",
        },
        preferences: {
          emailNotifications: true,
          theme: "light",
        },
      }

      const result = await userAPI.createUser(newUser, "admin-token123")

      expect(result).toHaveProperty("auth0Id", "auth0|new-user-123")
      expect(result).toHaveProperty("email", "newuser@cspb.edu.ph")
      expect(result).toHaveProperty("isActive", true)
      expect(result.metadata).toHaveProperty("createdAt")
    })
  })

  describe("PUT /api/users/:auth0Id", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user exists and can be updated",
        uponReceiving: "a request to update user profile",
        withRequest: {
          method: "PUT",
          path: "/api/users/auth0%7C687515def8dcc9049a9c9b57",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: like("Bearer token123"),
          },
          body: {
            name: like("Jason Updated"),
            profile: {
              firstName: like("Jason"),
              lastName: like("Updated"),
            },
            preferences: {
              emailNotifications: like(false),
              theme: like("dark"),
            },
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            auth0Id: like("auth0|687515def8dcc9049a9c9b57"),
            email: like("jason@cspb.edu.ph"),
            name: like("Jason Updated"),
            roles: eachLike("Admin"),
            isActive: like(true),
            profile: {
              firstName: like("Jason"),
              lastName: like("Updated"),
            },
            preferences: {
              emailNotifications: like(false),
              theme: like("dark"),
            },
            metadata: {
              createdAt: like("2025-08-19T10:00:00Z"),
              updatedAt: like("2025-08-19T11:00:00Z"),
              lastLoginAt: like("2025-08-19T10:30:00Z"),
            },
          },
        },
      })
    })

    it("should update user profile", async () => {
      const userAPI = new UserAPI("http://localhost:1235")
      const updateData = {
        name: "Jason Updated",
        profile: {
          firstName: "Jason",
          lastName: "Updated",
        },
        preferences: {
          emailNotifications: false,
          theme: "dark",
        },
      }

      const result = await userAPI.updateUser("auth0|687515def8dcc9049a9c9b57", updateData, "token123")

      expect(result).toHaveProperty("name", "Jason Updated")
      expect(result.profile).toHaveProperty("lastName", "Updated")
      expect(result.preferences).toHaveProperty("emailNotifications", false)
      expect(result.preferences).toHaveProperty("theme", "dark")
    })
  })

  describe("PUT /api/users/:auth0Id/roles", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user exists and admin can update roles",
        uponReceiving: "a request to update user roles",
        withRequest: {
          method: "PUT",
          path: "/api/users/auth0%7C687515def8dcc9049a9c9b57/roles",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: like("Bearer admin-token123"),
          },
          body: {
            roles: eachLike("Requester"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            auth0Id: like("auth0|687515def8dcc9049a9c9b57"),
            email: like("jason@cspb.edu.ph"),
            name: like("Jason Calalang"),
            roles: eachLike("Requester"),
            isActive: like(true),
            profile: {
              firstName: like("Jason"),
              lastName: like("Calalang"),
            },
            preferences: {
              emailNotifications: like(true),
              theme: like("light"),
            },
            metadata: {
              createdAt: like("2025-08-19T10:00:00Z"),
              updatedAt: like("2025-08-19T11:00:00Z"),
              lastLoginAt: like("2025-08-19T10:30:00Z"),
            },
          },
        },
      })
    })

    it("should update user roles (admin only)", async () => {
      const userAPI = new UserAPI("http://localhost:1235")
      const result = await userAPI.updateUserRoles(
        "auth0|687515def8dcc9049a9c9b57", 
        ["Requester"], 
        "admin-token123"
      )

      expect(result).toHaveProperty("roles")
      expect(result.roles).toContain("Requester")
    })
  })

  describe("DELETE /api/users/:auth0Id", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user exists and can be deactivated",
        uponReceiving: "a request to deactivate user",
        withRequest: {
          method: "DELETE",
          path: "/api/users/auth0%7C687515def8dcc9049a9c9b57",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer admin-token123"),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            auth0Id: like("auth0|687515def8dcc9049a9c9b57"),
            email: like("jason@cspb.edu.ph"),
            name: like("Jason Calalang"),
            roles: eachLike("Admin"),
            isActive: like(false),
            profile: {
              firstName: like("Jason"),
              lastName: like("Calalang"),
            },
            preferences: {
              emailNotifications: like(true),
              theme: like("light"),
            },
            metadata: {
              createdAt: like("2025-08-19T10:00:00Z"),
              updatedAt: like("2025-08-19T11:00:00Z"),
              lastLoginAt: like("2025-08-19T10:30:00Z"),
            },
          },
        },
      })
    })

    it("should deactivate user (soft delete)", async () => {
      const userAPI = new UserAPI("http://localhost:1235")
      const result = await userAPI.deactivateUser("auth0|687515def8dcc9049a9c9b57", "admin-token123")

      expect(result).toHaveProperty("isActive", false)
    })
  })

  describe("Error scenarios", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user does not exist",
        uponReceiving: "a request for non-existent user",
        withRequest: {
          method: "GET",
          path: "/api/users/auth0%7Cnonexistent",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer token123"),
          },
        },
        willRespondWith: {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: like("User not found"),
            code: like("USER_NOT_FOUND"),
          },
        },
      })
    })

    it("should handle non-existent user", async () => {
      const userAPI = new UserAPI("http://localhost:1235")

      await expect(userAPI.getUserByAuth0Id("auth0|nonexistent", "token123")).rejects.toThrow("HTTP error!")
    })
  })

  describe("Unauthorized access", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "user is not admin",
        uponReceiving: "a non-admin request for all users",
        withRequest: {
          method: "GET",
          path: "/api/users",
          headers: {
            Accept: "application/json",
            Authorization: like("Bearer requester-token123"),
          },
        },
        willRespondWith: {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: like("Insufficient permissions"),
            code: like("FORBIDDEN"),
          },
        },
      })
    })

    it("should prevent non-admin access to user list", async () => {
      const userAPI = new UserAPI("http://localhost:1235")

      await expect(userAPI.getAllUsers("requester-token123")).rejects.toThrow("HTTP error!")
    })
  })
})