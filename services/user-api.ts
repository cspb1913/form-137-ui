import { AuthenticatedHttpClient } from "@/lib/auth-http-client"

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
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_FORM137_API_URL || "http://localhost:8080"
    this.httpClient = new AuthenticatedHttpClient({ baseUrl: this.baseUrl })
    console.log('🔧 UserAPI initialized', { baseUrl: this.baseUrl })
  }

  /**
   * Get current user information based on the provided access token
   */
  async getCurrentUser(accessToken: string): Promise<User> {
    console.log('🔧 UserAPI.getCurrentUser called', { 
      hasToken: !!accessToken, 
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
      baseUrl: this.baseUrl 
    })
    return this.httpClient.get<User>("/api/users/me", accessToken, true)
  }

  /**
   * Get a specific user by their Auth0 ID
   */
  async getUserByAuth0Id(auth0Id: string, accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.httpClient.get<User>(`/api/users/${encodedAuth0Id}`, accessToken, true)
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(accessToken: string): Promise<User[]> {
    return this.httpClient.get<User[]>("/api/users", accessToken, true)
  }

  /**
   * Create a new user (Admin only)
   */
  async createUser(userData: CreateUserRequest, accessToken: string): Promise<User> {
    return this.httpClient.post<User>("/api/users", userData, accessToken, true)
  }

  /**
   * Update user profile information
   */
  async updateUser(auth0Id: string, userData: UpdateUserRequest, accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.httpClient.put<User>(`/api/users/${encodedAuth0Id}`, userData, accessToken, true)
  }

  /**
   * Update user roles (Admin only)
   */
  async updateUserRoles(auth0Id: string, roles: string[], accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    const requestData: UpdateUserRolesRequest = { roles }
    return this.httpClient.put<User>(`/api/users/${encodedAuth0Id}/roles`, requestData, accessToken, true)
  }

  /**
   * Deactivate a user (soft delete)
   */
  async deactivateUser(auth0Id: string, accessToken: string): Promise<User> {
    const encodedAuth0Id = encodeURIComponent(auth0Id)
    return this.httpClient.delete<User>(`/api/users/${encodedAuth0Id}`, accessToken, true)
  }
}

// Default instance for use throughout the application
export const userAPI = new UserAPI()