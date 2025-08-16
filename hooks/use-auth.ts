"use client"

import { useUser } from "@auth0/nextjs-auth0"
import { useDevAuth } from "@/lib/dev-auth0-provider"
import type { UserWithRoles } from "@/types/user"

interface AuthHook {
  user: UserWithRoles | null | undefined
  isLoading: boolean
  error?: Error
  login: () => void
  logout: () => void
  getAccessTokenSilently: () => Promise<string>
}

/**
 * Unified auth hook that works with both real Auth0 and development mode
 * Automatically switches based on NEXT_PUBLIC_DEV_MODE environment variable
 */
export function useAuth(): AuthHook {
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  if (isDevelopmentMode) {
    // Use development auth provider
    const devAuth = useDevAuth()
    return {
      user: devAuth.user,
      isLoading: devAuth.isLoading,
      error: devAuth.error,
      login: devAuth.login,
      logout: devAuth.logout,
      getAccessTokenSilently: devAuth.getAccessTokenSilently,
    }
  }

  // Use real Auth0
  const { user, isLoading, error } = useUser()
  
  // Transform Auth0 user to include roles from custom claims
  const userWithRoles: UserWithRoles | null = user
    ? {
        ...user,
        roles: user[`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/roles`] || [],
      }
    : null

  return {
    user: userWithRoles,
    isLoading,
    error,
    login: () => {
      window.location.href = "/api/auth/login"
    },
    logout: () => {
      window.location.href = "/api/auth/logout"
    },
    getAccessTokenSilently: async () => {
      // In production mode, use Auth0's getAccessToken
      const { getAccessToken } = await import("@auth0/nextjs-auth0")
      return getAccessToken({
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      })
    },
  }
}

/**
 * Development-aware page protection HOC
 * In development mode, this returns the component without requiring authentication
 */
export function withPageAuth<T extends object>(Component: React.ComponentType<T>) {
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  if (isDevelopmentMode) {
    // In development mode, return component without auth check
    return Component
  }

  // In production mode, use Auth0's page protection
  // For now, just return the component - page protection can be added later
  return Component
}