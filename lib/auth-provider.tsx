"use client"

import React from "react"
import { DevAuth0Provider } from "./dev-auth0-provider"

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Smart Auth provider that switches between client credentials and development mode
 * Auth0 has been replaced with client credentials authentication
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  if (isDevelopmentMode) {
    console.log("🔧 Running in Development Mode - Using mock authentication")
    return <DevAuth0Provider>{children}</DevAuth0Provider>
  }

  console.log("🔐 Running in Production Mode - Using client credentials authentication")
  
  // No Auth0 provider needed - using client credentials directly
  return <>{children}</>
}