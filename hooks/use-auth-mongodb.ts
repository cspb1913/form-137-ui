"use client"

import { useUser } from "@auth0/nextjs-auth0"
import { useDevAuth } from "@/lib/dev-auth0-provider"
import { useCurrentUserApi } from "@/hooks/use-current-user-api"
import type { User } from "@/services/user-api"

interface AuthHook {
  user: User | null | undefined
  isLoading: boolean
  error?: Error
  login: () => void
  logout: () => void
  getAccessTokenSilently: () => Promise<string>
  refetch?: () => Promise<void>
}

/**
 * Unified auth hook that works with MongoDB API, Auth0, and development mode
 * This replaces the old JWT role extraction with MongoDB API calls
 */
export function useAuth(): AuthHook {
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
  
  console.log('🔧 useAuth called', { 
    isDevelopmentMode, 
    devMode: process.env.NEXT_PUBLIC_DEV_MODE 
  })

  if (isDevelopmentMode) {
    console.log('🔧 Using development mode auth')
    // Use development auth provider (unchanged for dev mode)
    const devAuth = useDevAuth()
    return {
      user: devAuth.user as User, // Cast to User type for consistency
      isLoading: devAuth.isLoading,
      error: devAuth.error,
      login: devAuth.login,
      logout: devAuth.logout,
      getAccessTokenSilently: devAuth.getAccessTokenSilently,
    }
  }

  console.log('🔧 Using production mode auth with MongoDB API')
  // Use real Auth0 + MongoDB API for user data
  const { isLoading: auth0Loading, error: auth0Error } = useUser()
  const { user, isLoading: userApiLoading, error: userApiError, refetch } = useCurrentUserApi()

  const combinedError = auth0Error || userApiError

  return {
    user,
    isLoading: auth0Loading || userApiLoading,
    error: combinedError ? (combinedError instanceof Error ? combinedError : new Error(String(combinedError))) : undefined,
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
    refetch,
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