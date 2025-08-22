/**
 * Simple authentication client using direct API calls
 * No React hooks, just plain fetch calls
 */

export interface User {
  sub: string
  email: string
  name: string
  roles: string[]
  [key: string]: any
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

/**
 * Get current user from API
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('🔍 Fetching current user...')
    const response = await fetch('/api/auth/me/')
    
    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ User data received:', data.user)
    return data.user
  } catch (error) {
    console.error('❌ Failed to get current user:', error)
    return null
  }
}

/**
 * Get access token from API
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    console.log('🔐 Fetching access token...')
    const response = await fetch('/api/auth/access-token/')
    
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Access token received')
    return data.access_token
  } catch (error) {
    console.error('❌ Failed to get access token:', error)
    return null
  }
}

/**
 * Initialize authentication - call this on app startup
 */
export async function initializeAuth(): Promise<AuthState> {
  console.log('🚀 Initializing simple authentication...')
  
  const user = await getCurrentUser()
  const token = await getAccessToken()
  
  if (user && token) {
    console.log('✅ Authentication initialized successfully')
    return {
      user,
      isLoading: false,
      error: null
    }
  } else {
    console.log('❌ Authentication initialization failed')
    return {
      user: null,
      isLoading: false,
      error: 'Authentication failed'
    }
  }
}