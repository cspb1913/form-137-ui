"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { useGetAuth0Token } from '@/hooks/use-auth0-token'
import { userAPI, type User } from '@/services/user-api'

interface UseCurrentUserApiReturn {
  user: User | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook to get current user information from our MongoDB API
 * This replaces role extraction from JWT tokens with API calls
 */
export function useCurrentUserApi(): UseCurrentUserApiReturn {
  const { user: auth0User, isLoading: auth0Loading } = useUser()
  const getToken = useGetAuth0Token()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  console.log('🔧 useCurrentUserApi initialized', { 
    hasAuth0User: !!auth0User, 
    auth0Loading,
    email: auth0User?.email,
    timestamp: new Date().toISOString()
  })

  // Force immediate check if Auth0 seems to be loading indefinitely
  useEffect(() => {
    console.log('🔧 useCurrentUserApi mounted with auth0Loading:', auth0Loading)
  }, [])

  const fetchCurrentUser = async (forceCall = false) => {
    console.log('🔍 fetchCurrentUser called', { 
      auth0User: !!auth0User, 
      email: auth0User?.email, 
      forceCall 
    })
    
    // TEMP: Always try the API call since we know Auth0 is working via API routes
    // if (!auth0User && !forceCall) {
    //   console.log('❌ No Auth0 user, skipping MongoDB API call')
    //   setUser(null)
    //   setIsLoading(false)
    //   return
    // }

    try {
      console.log('🔄 Starting MongoDB API call (authentication disabled)...')
      setError(null)
      
      console.log('📡 Calling MongoDB API directly without authentication...')
      // Since API auth is disabled, call API directly without any authentication checks
      const apiUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }
      
      const userData = await response.json()
      console.log('✅ MongoDB API response:', userData)
      
      setUser(userData)
    } catch (err) {
      console.error('❌ Failed to fetch current user:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch current user'))
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 useCurrentUserApi useEffect triggered - API auth disabled, calling immediately')
    // Since API authentication is disabled, we can call immediately without waiting for Auth0
    fetchCurrentUser(true)
  }, [])

  // Add a fallback mechanism if Auth0 loading gets stuck
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (auth0Loading && !user) {
        console.log('⚠️ Auth0 loading timeout - checking Auth0 session directly')
        // Try to check if there's an Auth0 session by calling /api/auth/me
        fetch('/api/auth/me')
          .then(response => {
            if (response.ok) {
              console.log('✅ Auth0 session exists - forcing MongoDB API call')
              fetchCurrentUser(true) // Force call even without auth0User
            } else {
              console.log('❌ No Auth0 session found')
            }
          })
          .catch(error => {
            console.log('❌ Error checking Auth0 session:', error)
          })
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(fallbackTimer)
  }, [auth0Loading, user])

  // Add a timeout to periodically check Auth0 state
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Periodic Auth0 state check', { 
        auth0Loading, 
        hasAuth0User: !!auth0User, 
        email: auth0User?.email,
        timestamp: new Date().toISOString()
      })
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [auth0User, auth0Loading])

  const refetch = async () => {
    setIsLoading(true)
    await fetchCurrentUser()
  }

  return {
    user,
    isLoading: isLoading, // Don't depend on auth0Loading since API auth is disabled
    error,
    refetch
  }
}