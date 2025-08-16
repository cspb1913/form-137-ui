"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { UserProfile } from "@auth0/nextjs-auth0"
import type { UserWithRoles } from "@/types/user"

interface DevAuthState {
  user: UserWithRoles | null
  isLoading: boolean
  error?: Error
}

interface DevAuthContextType extends DevAuthState {
  login: () => void
  logout: () => void
  getAccessTokenSilently: () => Promise<string>
}

const DevAuthContext = createContext<DevAuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  getAccessTokenSilently: async () => "",
})

interface DevAuthProviderProps {
  children: React.ReactNode
}

/**
 * Mock Auth0 provider for development mode
 * This provider simulates Auth0 authentication without requiring real Auth0 credentials
 */
export function DevAuth0Provider({ children }: DevAuthProviderProps) {
  const [authState, setAuthState] = useState<DevAuthState>({
    user: null,
    isLoading: true,
  })

  // Create mock user from environment variables or localStorage
  const createMockUser = (): UserWithRoles => {
    // Check localStorage first (for profile switching), then environment variables
    let email = process.env.NEXT_PUBLIC_DEV_USER_EMAIL || "dev@example.com"
    let name = process.env.NEXT_PUBLIC_DEV_USER_NAME || "Development User"
    let role = process.env.NEXT_PUBLIC_DEV_USER_ROLE || "Requester"
    
    if (typeof window !== "undefined") {
      email = localStorage.getItem("dev-user-email") || email
      name = localStorage.getItem("dev-user-name") || name
      role = localStorage.getItem("dev-user-role") || role
    }
    
    return {
      sub: `dev|${email.split("@")[0]}`,
      email,
      name,
      nickname: email.split("@")[0],
      picture: "/placeholder-user.jpg",
      email_verified: true,
      updated_at: new Date().toISOString(),
      roles: ['Admin', 'Requester'], // Give both roles for testing
      // Add Auth0 namespace claims for roles
      [`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/roles`]: ['Admin', 'Requester'],
    }
  }

  // Generate a fake JWT token for API calls using the JWT generator
  const generateMockToken = (): string => {
    const { generateDevJWT } = require("./dev-jwt-generator")
    return generateDevJWT({
      email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL || "dev@example.com",
      name: process.env.NEXT_PUBLIC_DEV_USER_NAME || "Development User",
      role: process.env.NEXT_PUBLIC_DEV_USER_ROLE || "Requester",
      expirationHours: 24,
    })
  }

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setAuthState({
        user: createMockUser(),
        isLoading: false,
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const login = () => {
    console.log("🔧 Development Mode: Mock login triggered")
    setAuthState({
      user: createMockUser(),
      isLoading: false,
    })
  }

  const logout = () => {
    console.log("🔧 Development Mode: Mock logout triggered")
    setAuthState({
      user: null,
      isLoading: false,
    })
  }

  const getAccessTokenSilently = async (): Promise<string> => {
    console.log("🔧 Development Mode: Generating mock access token")
    return generateMockToken()
  }

  return (
    <DevAuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        getAccessTokenSilently,
      }}
    >
      {children}
    </DevAuthContext.Provider>
  )
}

export const useDevAuth = () => {
  const context = useContext(DevAuthContext)
  if (!context) {
    throw new Error("useDevAuth must be used within a DevAuth0Provider")
  }
  return context
}