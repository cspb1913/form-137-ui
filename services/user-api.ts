import { AuthenticatedHttpClient } from "@/lib/auth-http-client"
import { SecureAuth0ApiClient } from "@/lib/secure-api-client"

export interface User {
  auth0Id: string
  email: string
  name: string
  roles: string[]
  isActive: boolean
  profile: {
    firstName: string
    lastName: string
  }
  preferences: {
    emailNotifications: boolean
    theme: string
  }
  metadata: {
    createdAt: string
    updatedAt: string
    lastLoginAt: string | null
  }
}

export interface CreateUserRequest {
  auth0Id: string
  email: string
  name: string
  roles: string[]
  profile: {
    firstName: string
    lastName: string
  }
  preferences: {
    emailNotifications: boolean
    theme: string
  }
}

export interface UpdateUserRequest {
  name?: string
  profile?: {
    firstName?: string
    lastName?: string
  }
  preferences?: {
    emailNotifications?: boolean
    theme?: string
  }
}

export interface UpdateUserRolesRequest {
  roles: string[]
}

export class UserAPI {
  private httpClient: AuthenticatedHttpClient
  private secureClient: SecureAuth0ApiClient
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_FORM137_API_URL || "http://localhost:8080"
    this.httpClient = new AuthenticatedHttpClient({ baseUrl: this.baseUrl })
    this.secureClient = new SecureAuth0ApiClient({ baseUrl: this.baseUrl })
    console.log('🔧 UserAPI initialized with enhanced security', { baseUrl: this.baseUrl })
  }

  /**
   * Get current user information using secure Auth0 token flow
   * This method uses the enhanced secure client with built-in security features
   */
  async getCurrentUser(): Promise<User> {
    console.log('🔐 UserAPI.getCurrentUser called - using existing auth client instead of secure client (temporary fix)')
    // Temporary fix: Use existing AuthenticatedHttpClient instead of SecureAuth0ApiClient
    // to avoid client-side token retrieval issues
    return this.httpClient.get<User>("/api/users/me", undefined, true)
  }

  /**
   * Legacy method for backward compatibility - still supports direct token passing
   */
  async getCurrentUserWithToken(accessToken: string): Promise<User> {
    console.log('🔧 UserAPI.getCurrentUserWithToken called', { 
      hasToken: !!accessToken, 
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
      baseUrl: this.baseUrl 
    })
    return this.httpClient.get<User>("/api/users/me", accessToken, true)
  }

  /**
   * Get a specific user by their Auth0 ID using secure client
   */
  async getUserByAuth0Id(auth0Id: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.secureClient.get<User>(`/api/users/${encodedAuth0Id}`)
  }

  /**
   * Get all users (Admin only) using secure client
   */
  async getAllUsers(): Promise<User[]> {
    return this.secureClient.get<User[]>("/api/users")
  }

  /**
   * Create a new user (Admin only) using secure client
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.secureClient.post<User>("/api/users", userData)
  }

  /**
   * Update user profile information using secure client
   */
  async updateUser(auth0Id: string, userData: UpdateUserRequest): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.secureClient.put<User>(`/api/users/${encodedAuth0Id}`, userData)
  }

  /**
   * Update user roles (Admin only) using secure client
   */
  async updateUserRoles(auth0Id: string, roles: string[]): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    const requestData: UpdateUserRolesRequest = { roles }
    return this.secureClient.put<User>(`/api/users/${encodedAuth0Id}/roles`, requestData)
  }

  /**
   * Deactivate a user (soft delete) using secure client
   */
  async deactivateUser(auth0Id: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.secureClient.delete<User>(`/api/users/${encodedAuth0Id}`)
  }

  // Legacy methods for backward compatibility with token passing
  async getUserByAuth0IdWithToken(auth0Id: string, accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.httpClient.get<User>(`/api/users/${encodedAuth0Id}`, accessToken, true)
  }

  async getAllUsersWithToken(accessToken: string): Promise<User[]> {
    return this.httpClient.get<User[]>("/api/users", accessToken, true)
  }

  async createUserWithToken(userData: CreateUserRequest, accessToken: string): Promise<User> {
    return this.httpClient.post<User>("/api/users", userData, accessToken, true)
  }

  async updateUserWithToken(auth0Id: string, userData: UpdateUserRequest, accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.httpClient.put<User>(`/api/users/${encodedAuth0Id}`, userData, accessToken, true)
  }

  async updateUserRolesWithToken(auth0Id: string, roles: string[], accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    const requestData: UpdateUserRolesRequest = { roles }
    return this.httpClient.put<User>(`/api/users/${encodedAuth0Id}/roles`, requestData, accessToken, true)
  }

  async deactivateUserWithToken(auth0Id: string, accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.httpClient.delete<User>(`/api/users/${encodedAuth0Id}`, accessToken, true)
  }
}

// Default instance for use throughout the application
export const userAPI = new UserAPI()