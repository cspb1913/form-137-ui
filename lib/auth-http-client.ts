/**
 * Standardized HTTP client for Auth0 authenticated API requests
 * 
 * This module provides a consistent pattern for making authenticated API calls
 * across the form-137-ui application using Auth0 bearer tokens.
 */

export interface AuthenticatedRequestOptions extends RequestInit {
  requireAuth?: boolean
  audience?: string
}

export interface HttpClientOptions {
  baseUrl?: string
  defaultAudience?: string
}

/**
 * Standardized HTTP client that handles Auth0 authentication consistently
 */
export class AuthenticatedHttpClient {
  private baseUrl: string
  private defaultAudience: string

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_FORM137_API_URL || ""
    this.defaultAudience = options.defaultAudience || process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || ""
  }

  /**
   * Make an authenticated HTTP request
   * 
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param options - Request options including authentication requirements
   * @param accessToken - Optional Auth0 access token
   */
  async request<T>(
    endpoint: string, 
    options: AuthenticatedRequestOptions = {}, 
    accessToken?: string
  ): Promise<T> {
    const { requireAuth = false, audience, ...requestOptions } = options
    const url = `${this.baseUrl}${endpoint}`

    // Prepare headers
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...requestOptions.headers as Record<string, string>,
    }

    // Add Authorization header if token is provided
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`
    } else if (requireAuth) {
      throw new Error("Authentication required but no access token provided")
    }

    const response = await fetch(url, {
      ...requestOptions,
      headers,
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Ignore JSON parsing errors and use default message
      }

      throw new Error(errorMessage)
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T
    }

    return response.json()
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, accessToken?: string, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", requireAuth }, accessToken)
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    accessToken?: string, 
    requireAuth = false
  ): Promise<T> {
    return this.request<T>(
      endpoint, 
      { 
        method: "POST", 
        body: data ? JSON.stringify(data) : undefined,
        requireAuth 
      }, 
      accessToken
    )
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string, 
    data?: any, 
    accessToken?: string, 
    requireAuth = false
  ): Promise<T> {
    return this.request<T>(
      endpoint, 
      { 
        method: "PATCH", 
        body: data ? JSON.stringify(data) : undefined,
        requireAuth 
      }, 
      accessToken
    )
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, accessToken?: string, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", requireAuth }, accessToken)
  }
}

// Export a default instance
export const httpClient = new AuthenticatedHttpClient()

/**
 * Auth0 token retrieval helper with error handling
 * 
 * @param getAccessToken - Auth0's getAccessToken function
 * @param audience - Optional audience override
 */
export async function getAuth0Token(
  getAccessToken: (options?: { audience?: string }) => Promise<string>,
  audience?: string
): Promise<string> {
  try {
    return await getAccessToken({
      audience: audience || process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    })
  } catch (error) {
    console.error("Failed to retrieve Auth0 access token:", error)
    throw new Error("Authentication failed. Please log in again.")
  }
}

/**
 * Utility type for API service methods that support optional authentication
 */
export type OptionalAuthMethod<TArgs extends any[], TReturn> = (
  ...args: [...TArgs, accessToken?: string]
) => Promise<TReturn>

/**
 * Utility type for API service methods that require authentication
 */
export type RequiredAuthMethod<TArgs extends any[], TReturn> = (
  ...args: [...TArgs, accessToken: string]
) => Promise<TReturn>