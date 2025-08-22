import type { UserWithRoles } from "@/types/user"

// Type alias for backward compatibility
type User = UserWithRoles

export type UserRole = "Admin" | "Requester"

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) {
    console.log('hasRole: user is null/undefined')
    return false
  }
  
  if (!user.roles) {
    console.log('hasRole: user.roles is null/undefined', { user })
    return false
  }
  
  const hasRoleResult = user.roles.includes(role)
  console.log('hasRole check:', { 
    role, 
    userRoles: user.roles, 
    hasRole: hasRoleResult,
    userKeys: Object.keys(user)
  })
  
  return hasRoleResult
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, "Admin")
}

/**
 * Check if a user is a requester
 */
export function isRequester(user: User | null): boolean {
  return hasRole(user, "Requester")
}

/**
 * Get the primary role of a user (first role in the array)
 */
export function getPrimaryRole(user: User | null): UserRole | null {
  if (!user || !user.roles || user.roles.length === 0) {
    return null
  }
  return user.roles[0] as UserRole
}

/**
 * Check if a user can access the admin panel
 */
export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if a user can access the dashboard
 */
export function canAccessDashboard(user: User | null): boolean {
  // Both requesters and admins should be able to access the dashboard
  // Admins need to see what requesters see for oversight purposes
  return isRequester(user) || isAdmin(user)
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "Unknown User"
  
  if (user.profile?.firstName && user.profile?.lastName) {
    return `${user.profile.firstName} ${user.profile.lastName}`
  }
  
  return user.name || user.email || "Unknown User"
}

/**
 * Check if user is active
 */
export function isActiveUser(user: User | null): boolean {
  return user?.isActive === true
}