"use client"

import { useState, useEffect } from 'react'
import { type User } from '@/services/user-api'
import { httpClient } from '@/lib/auth-http-client'

interface UseCurrentUserApiReturn {
  user: User | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook to get current user information from our MongoDB API
 * Using client credentials authentication (no Auth0 dependency)
 */
export function useCurrentUserApi(): UseCurrentUserApiReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
  
  console.log('🔧 useCurrentUserApi initialized', { 
    isDevelopmentMode,
    devMode: process.env.NEXT_PUBLIC_DEV_MODE,
    timestamp: new Date().toISOString()
  })

  const fetchCurrentUser = async () => {
    console.log('🔍 fetchCurrentUser called')
    
    try {
      console.log('🔄 Starting MongoDB API call with client credentials...')
      setError(null)
      
      if (isDevelopmentMode) {
        console.log('🔧 Using development mode auth with MongoDB API')
      } else {
        console.log('🔧 Using production mode auth with MongoDB API')
      }
      
      console.log('📡 Calling MongoDB API with client credentials...')
      // Use our AuthenticatedHttpClient with hardcoded client credentials
      const userData = await httpClient.get('/api/users/me')
      
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
    console.log('🔄 useCurrentUserApi useEffect triggered - calling immediately with client credentials')
    fetchCurrentUser()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    await fetchCurrentUser()
  }

  return {
    user,
    isLoading,
    error,
    refetch
  }
}