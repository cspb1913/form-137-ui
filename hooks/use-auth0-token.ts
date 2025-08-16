/**
 * Custom hook for Auth0 token management
 * 
 * Provides a consistent interface for retrieving Auth0 access tokens
 * with proper error handling and loading states.
 */

import { useCallback, useState } from "react"
import { getAccessToken } from "@auth0/nextjs-auth0/client"
import { getAuth0Token } from "@/lib/auth-http-client"

interface UseAuth0TokenOptions {
  audience?: string
  onError?: (error: Error) => void
}

interface UseAuth0TokenReturn {
  getToken: () => Promise<string>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook for managing Auth0 access token retrieval
 * 
 * @param options - Configuration options
 * @returns Token retrieval function and state
 */
export function useAuth0Token(options: UseAuth0TokenOptions = {}): UseAuth0TokenReturn {
  const { audience, onError } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getToken = useCallback(async (): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getAuth0Token(getAccessToken, audience)
      return token
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get access token")
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [audience, onError])

  return {
    getToken,
    isLoading,
    error,
  }
}

/**
 * Simplified hook for one-time token retrieval
 * 
 * @param audience - Optional audience override
 * @returns Promise resolving to access token
 */
export function useGetAuth0Token(audience?: string) {
  return useCallback(async (): Promise<string> => {
    return getAuth0Token(getAccessToken, audience)
  }, [audience])
}