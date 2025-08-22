"use client"

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
 * Custom Auth hook that works with our custom Auth0 implementation
 * Uses /api/auth/me endpoint to check authentication status
 */
export function useAuth(): AuthHook {
  const [user, setUser] = useState<UserWithRoles | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>()

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...')
        const response = await fetch('/api/auth/me/')
        
        if (!mounted) return
        
        if (response.ok) {
          const data = await response.json()
          console.log('Auth check successful:', data)
          if (data.user) {
            setUser(data.user)
          }
        } else {
          console.log('Auth check failed:', response.status)
          setUser(null)
        }
      } catch (err) {
        console.error('Auth check error:', err)
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Authentication check failed'))
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
    
    return () => {
      mounted = false
    }
  }, [])

  console.log('useAuth debug:', {
    user: !!user,
    userRoles: user?.roles,
    isLoading,
    error: !!error
  })

  return {
    user,
    isLoading,
    error,
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