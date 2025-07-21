import type { UserWithRoles, UserRole } from "@/types/user"

/**
 * Check if a user has a specific role
 */
export function hasRole(user: UserWithRoles | null, role: UserRole): boolean {
  if (!user || !user.roles) {
    return false
  }
  return user.roles.includes(role)
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: UserWithRoles | null): boolean {
  return hasRole(user, "Admin")
}

/**
 * Check if a user is a requester
 */
export function isRequester(user: UserWithRoles | null): boolean {
  return hasRole(user, "Requester")
}

/**
 * Get the primary role of a user (first role in the array)
 */
export function getPrimaryRole(user: UserWithRoles | null): UserRole | null {
  if (!user || !user.roles || user.roles.length === 0) {
    return null
  }
  return user.roles[0] as UserRole
}

/**
 * Check if a user can access the admin panel
 */
export function canAccessAdmin(user: UserWithRoles | null): boolean {
  return isAdmin(user)
}

/**
 * Check if a user can access the dashboard
 */
export function canAccessDashboard(user: UserWithRoles | null): boolean {
  return isRequester(user)
}