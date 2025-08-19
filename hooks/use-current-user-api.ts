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
      console.log('🔄 Starting MongoDB API call...')
      setError(null)
      
      // First check if we have an Auth0 session via API
      console.log('🔍 Checking Auth0 session via /api/auth/me')
      const auth0Response = await fetch('/api/auth/me')
      if (!auth0Response.ok) {
        console.log('❌ No Auth0 session found via API')
        setUser(null)
        setIsLoading(false)
        return
      }
      
      const auth0Data = await auth0Response.json()
      console.log('✅ Auth0 session found:', auth0Data.email)
      
      console.log('📡 Getting Auth0 token for MongoDB API...')
      const token = await getToken()
      console.log('✅ Auth0 token obtained, calling MongoDB API...')
      const userData = await userAPI.getCurrentUserWithToken(token)
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
    console.log('🔄 useCurrentUserApi useEffect triggered', { 
      auth0Loading, 
      hasAuth0User: !!auth0User, 
      email: auth0User?.email,
      timestamp: new Date().toISOString()
    })
    
    if (!auth0Loading) {
      console.log('✅ Auth0 not loading, calling fetchCurrentUser')
      fetchCurrentUser()
    } else {
      console.log('⏳ Auth0 still loading, waiting...')
      // TEMP: Also try to fetch after a timeout even if Auth0 is loading
      const timeout = setTimeout(() => {
        console.log('⚠️ Auth0 loading timeout - trying fetchCurrentUser anyway')
        fetchCurrentUser(true)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [auth0User, auth0Loading])

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
    isLoading: isLoading || auth0Loading,
    error,
    refetch
  }
}