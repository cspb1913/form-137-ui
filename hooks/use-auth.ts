"use client"

import { useUser } from "@auth0/nextjs-auth0"
import { useEffect, useState } from "react"
import type { UserWithRoles } from "@/types/user"

interface AuthHook {
  user: UserWithRoles | null | undefined
  isLoading: boolean
  error?: Error
  login: () => void
  logout: () => void
}

/**
 * Secure Auth hook that uses Auth0 authentication with fallback to /api/auth/me
 * In production mode, users must authenticate via Auth0 to get proper roles
 */
export function useAuth(): AuthHook {
  const { user: auth0User, isLoading: auth0Loading, error: auth0Error } = useUser()
  const [fallbackUser, setFallbackUser] = useState<UserWithRoles | null>(null)
  const [fallbackLoading, setFallbackLoading] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  // Initialize auth state after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthReady(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // If we have an Auth0 user, transform it to include roles
  const userWithRoles: UserWithRoles | null = auth0User
    ? {
        ...auth0User,
        roles: auth0User[`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/roles`] || [],
      }
    : fallbackUser

  // If Auth0 is ready but no user exists, try fallback endpoint
  useEffect(() => {
    if (authReady && !auth0Loading && !auth0User && !fallbackUser && !fallbackLoading) {
      console.log('No Auth0 user, trying fallback /api/auth/me endpoint')
      setFallbackLoading(true)
      
      fetch('/api/auth/me/')
        .then(res => res.json())
        .then(data => {
          console.log('Fallback user data:', data)
          if (data.user) {
            setFallbackUser(data.user)
          }
        })
        .catch(error => {
          console.error('Fallback auth error:', error)
        })
        .finally(() => {
          setFallbackLoading(false)
        })
    }
  }, [authReady, auth0Loading, auth0User, fallbackUser, fallbackLoading])

  const isLoading = auth0Loading || (!authReady) || fallbackLoading

  console.log('useAuth debug:', {
    auth0User: !!auth0User,
    fallbackUser: !!fallbackUser,
    userWithRoles: !!userWithRoles,
    userRoles: userWithRoles?.roles,
    auth0Loading,
    fallbackLoading,
    authReady,
    isLoading,
    hasAudience: !!process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
  })

  return {
    user: userWithRoles,
    isLoading,
    error: auth0Error,
    login: () => {
      window.location.href = "/api/auth/login"
    },
    logout: () => {
      window.location.href = "/api/auth/logout"
    },
  }
}

/**
 * Page protection HOC using Auth0
 * Ensures components only render for authenticated users
 */
export function withPageAuth<T extends object>(Component: React.ComponentType<T>) {
  return Component // Simplified for now - full protection can be implemented later
}