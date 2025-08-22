/**
 * Secure Auth0 API Client for Form 137 Application
 * 
 * This module provides a comprehensive Auth0-authenticated HTTP client
 * that implements security best practices and integrates seamlessly
 * with the Spring Boot backend's OAuth2 Resource Server configuration.
 * 
 * Security Features:
 * - Zero Trust Architecture - Every request is authenticated
 * - Defense in Depth - Multiple layers of validation
 * - Secure by Default - Authentication required unless explicitly disabled
 * - Least Privilege Access - Fine-grained permissions
 */

import { useUser } from '@auth0/nextjs-auth0'

export interface SecureRequestOptions extends RequestInit {
  requireAuth?: boolean
  skipTokenValidation?: boolean
  audience?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
}

/**
 * Secure Auth0 API Client implementing security by design principles
 */
export class SecureAuth0ApiClient {
  private baseUrl: string
  private defaultAudience: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FORM137_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
    this.defaultAudience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "http://localhost:8080/api"
    
    if (!this.baseUrl) {
      throw new Error("API base URL must be configured")
    }
    
    console.log('🔧 SecureAuth0ApiClient initialized', {
      baseUrl: this.baseUrl,
      audience: this.defaultAudience,
      devMode: process.env.NEXT_PUBLIC_DEV_MODE
    })
  }

  /**
   * Get Auth0 access token with comprehensive error handling
   */
  private async getAccessToken(): Promise<string> {
    try {
      console.log('🔐 Requesting Auth0 access token...')
      
      const response = await fetch('/api/auth/access-token', {
        method: 'GET',
        credentials: 'same-origin', // Ensure cookies are sent
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.')
        }
        
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Authentication failed: ${response.status} ${response.statusText}`
        )
      }

      const tokenData = await response.json()
      
      if (!tokenData.access_token) {
        throw new Error('No access token received from Auth0')
      }

      console.log('✅ Auth0 access token obtained successfully')
      return tokenData.access_token
    } catch (error) {
      console.error('❌ Failed to get Auth0 access token:', error)
      throw error instanceof Error ? error : new Error('Token retrieval failed')
    }
  }

  /**
   * Secure HTTP request with Auth0 JWT authentication
   */
  async secureRequest<T>(
    endpoint: string,
    options: SecureRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { 
      requireAuth = true, 
      skipTokenValidation = false,
      audience,
      ...requestOptions 
    } = options

    const url = `${this.baseUrl}${endpoint}`
    console.log('🌐 SecureAuth0ApiClient.secureRequest', {
      endpoint,
      url,
      requireAuth,
      method: requestOptions.method || 'GET'
    })

    // Security validation - always require auth unless explicitly disabled
    if (!requireAuth && !skipTokenValidation) {
      console.warn('⚠️ Making unauthenticated request to:', endpoint)
    }

    // Prepare secure headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      ...requestOptions.headers as Record<string, string>,
    }

    // Add Authorization header for authenticated requests
    if (requireAuth) {
      try {
        const accessToken = await this.getAccessToken()
        headers['Authorization'] = `Bearer ${accessToken}`
        console.log('🔐 Authorization header added')
      } catch (tokenError) {
        console.error('❌ Failed to get access token:', tokenError)
        return {
          error: 'Authentication failed',
          message: tokenError instanceof Error ? tokenError.message : 'Unknown auth error',
          status: 401
        }
      }
    }

    // Make the secure request
    try {
      console.log('🚀 Making secure API request:', { url, method: requestOptions.method || 'GET' })
      
      const response = await fetch(url, {
        ...requestOptions,
        headers,
        credentials: 'same-origin', // Security: include cookies but only for same-origin
      })

      console.log('📡 API response received:', { 
        status: response.status, 
        statusText: response.statusText,
        url: response.url
      })

      // Handle different response types
      const contentType = response.headers.get('content-type')
      let responseData: T | null = null

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      }

      if (!response.ok) {
        const errorMessage = (responseData as any)?.message || 
                           (responseData as any)?.error || 
                           `HTTP ${response.status}: ${response.statusText}`
        
        console.error('❌ API request failed:', {
          status: response.status,
          message: errorMessage,
          url
        })

        return {
          error: errorMessage,
          status: response.status,
          data: responseData
        }
      }

      console.log('✅ API request successful')
      return {
        data: responseData,
        status: response.status
      }

    } catch (networkError) {
      console.error('❌ Network error during API request:', networkError)
      return {
        error: 'Network error',
        message: networkError instanceof Error ? networkError.message : 'Unknown network error',
        status: 0
      }
    }
  }

  /**
   * Secure GET request
   */
  async get<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.secureRequest<T>(endpoint, { method: 'GET', requireAuth })
  }

  /**
   * Secure POST request
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    requireAuth = true
  ): Promise<ApiResponse<T>> {
    return this.secureRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth
    })
  }

  /**
   * Secure PATCH request
   */
  async patch<T>(
    endpoint: string, 
    data?: any, 
    requireAuth = true
  ): Promise<ApiResponse<T>> {
    return this.secureRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth
    })
  }

  /**
   * Secure PUT request
   */
  async put<T>(
    endpoint: string, 
    data?: any, 
    requireAuth = true
  ): Promise<ApiResponse<T>> {
    return this.secureRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth
    })
  }

  /**
   * Secure DELETE request
   */
  async delete<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.secureRequest<T>(endpoint, { method: 'DELETE', requireAuth })
  }

  /**
   * Public endpoint request (explicitly unauthenticated)
   * Use this only for truly public endpoints like health checks
   */
  async publicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    console.log('🌍 Making public API request to:', endpoint)
    return this.secureRequest<T>(endpoint, { 
      ...options, 
      requireAuth: false,
      skipTokenValidation: true 
    })
  }
}

// Export a singleton instance
export const secureApiClient = new SecureAuth0ApiClient()

/**
 * React Hook for secure Auth0 API client with user context
 * 
 * This hook provides access to the secure API client with Auth0 user context
 * and handles loading states appropriately.
 */
export function useSecureApiClient() {
  const { user, isLoading, error } = useUser()
  
  return {
    apiClient: secureApiClient,
    user,
    isAuthenticated: !!user,
    isLoading,
    authError: error,
  }
}

/**
 * Security validation helper
 */
export function validateApiResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error)
  }
  
  if (response.status >= 400) {
    throw new Error(response.message || `API error: ${response.status}`)
  }
  
  if (!response.data) {
    throw new Error('No data received from API')
  }
  
  return response.data
}

export default secureApiClient