"use client"

import React from "react"
import { DevAuth0Provider } from "./dev-auth0-provider"

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Smart Auth provider that switches between real Auth0 and development mode
 * based on the NEXT_PUBLIC_DEV_MODE environment variable
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  if (isDevelopmentMode) {
    console.log("🔧 Running in Development Mode - Auth0 authentication bypassed")
    return <DevAuth0Provider>{children}</DevAuth0Provider>
  }

  console.log("🔐 Running in Production Mode - Using real Auth0 authentication")
  
  // In Next.js 13+ App Router, Auth0 works via API routes without needing a client provider
  // The useUser hook connects directly to the session via the API routes
  return <>{children}</>
}