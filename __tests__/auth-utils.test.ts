import { 
  hasRole, 
  isAdmin, 
  isRequester, 
  getPrimaryRole, 
  canAccessAdmin, 
  canAccessDashboard 
} from "@/lib/auth-utils"
import type { UserWithRoles } from "@/types/user"

describe("Auth Utilities", () => {
  const adminUser: UserWithRoles = {
    sub: "auth0|admin",
    name: "Admin User",
    email: "admin@example.com",
    roles: ["Admin"],
  }

  const requesterUser: UserWithRoles = {
    sub: "auth0|requester",
    name: "Requester User",
    email: "requester@example.com",
    roles: ["Requester"],
  }

  const multiRoleUser: UserWithRoles = {
    sub: "auth0|multi",
    name: "Multi Role User",
    email: "multi@example.com",
    roles: ["Admin", "Requester"],
  }

  const noRolesUser: UserWithRoles = {
    sub: "auth0|noroles",
    name: "No Roles User",
    email: "noroles@example.com",
    roles: [],
  }

  const undefinedRolesUser: UserWithRoles = {
    sub: "auth0|undefined",
    name: "Undefined Roles User",
    email: "undefined@example.com",
    // roles property is undefined
  }

  describe("hasRole", () => {
    it("returns true when user has the specified role", () => {
      expect(hasRole(adminUser, "Admin")).toBe(true)
      expect(hasRole(requesterUser, "Requester")).toBe(true)
      expect(hasRole(multiRoleUser, "Admin")).toBe(true)
      expect(hasRole(multiRoleUser, "Requester")).toBe(true)
    })

    it("returns false when user does not have the specified role", () => {
      expect(hasRole(adminUser, "Requester")).toBe(false)
      expect(hasRole(requesterUser, "Admin")).toBe(false)
    })

    it("returns false when user is null", () => {
      expect(hasRole(null, "Admin")).toBe(false)
      expect(hasRole(null, "Requester")).toBe(false)
    })

    it("returns false when user has no roles", () => {
      expect(hasRole(noRolesUser, "Admin")).toBe(false)
      expect(hasRole(noRolesUser, "Requester")).toBe(false)
    })

    it("returns false when user has undefined roles", () => {
      expect(hasRole(undefinedRolesUser, "Admin")).toBe(false)
      expect(hasRole(undefinedRolesUser, "Requester")).toBe(false)
    })
  })

  describe("isAdmin", () => {
    it("returns true for admin users", () => {
      expect(isAdmin(adminUser)).toBe(true)
      expect(isAdmin(multiRoleUser)).toBe(true)
    })

    it("returns false for non-admin users", () => {
      expect(isAdmin(requesterUser)).toBe(false)
      expect(isAdmin(noRolesUser)).toBe(false)
      expect(isAdmin(undefinedRolesUser)).toBe(false)
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe("isRequester", () => {
    it("returns true for requester users", () => {
      expect(isRequester(requesterUser)).toBe(true)
      expect(isRequester(multiRoleUser)).toBe(true)
    })

    it("returns false for non-requester users", () => {
      expect(isRequester(adminUser)).toBe(false)
      expect(isRequester(noRolesUser)).toBe(false)
      expect(isRequester(undefinedRolesUser)).toBe(false)
      expect(isRequester(null)).toBe(false)
    })
  })

  describe("getPrimaryRole", () => {
    it("returns the first role in the roles array", () => {
      expect(getPrimaryRole(adminUser)).toBe("Admin")
      expect(getPrimaryRole(requesterUser)).toBe("Requester")
      expect(getPrimaryRole(multiRoleUser)).toBe("Admin")
    })

    it("returns null when user has no roles", () => {
      expect(getPrimaryRole(noRolesUser)).toBe(null)
      expect(getPrimaryRole(undefinedRolesUser)).toBe(null)
      expect(getPrimaryRole(null)).toBe(null)
    })
  })

  describe("canAccessAdmin", () => {
    it("returns true for admin users", () => {
      expect(canAccessAdmin(adminUser)).toBe(true)
      expect(canAccessAdmin(multiRoleUser)).toBe(true)
    })

    it("returns false for non-admin users", () => {
      expect(canAccessAdmin(requesterUser)).toBe(false)
      expect(canAccessAdmin(noRolesUser)).toBe(false)
      expect(canAccessAdmin(undefinedRolesUser)).toBe(false)
      expect(canAccessAdmin(null)).toBe(false)
    })
  })

  describe("canAccessDashboard", () => {
    it("returns true for requester users", () => {
      expect(canAccessDashboard(requesterUser)).toBe(true)
      expect(canAccessDashboard(multiRoleUser)).toBe(true)
    })

    it("returns false for non-requester users", () => {
      expect(canAccessDashboard(adminUser)).toBe(false)
      expect(canAccessDashboard(noRolesUser)).toBe(false)
      expect(canAccessDashboard(undefinedRolesUser)).toBe(false)
      expect(canAccessDashboard(null)).toBe(false)
    })
  })
})