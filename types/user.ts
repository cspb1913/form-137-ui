import type { UserProfile } from "@auth0/nextjs-auth0"

export interface UserWithRoles extends UserProfile {
  roles?: string[]
}

export type UserRole = "Admin" | "Requester"

export interface UserSession {
  user: UserWithRoles | null
  isLoading: boolean
  isError: boolean
}