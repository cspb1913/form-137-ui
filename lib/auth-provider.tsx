"use client"

import React from "react"
import { Auth0Provider } from "@auth0/nextjs-auth0"
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
  
  return (
    <Auth0Provider>
      {children}
    </Auth0Provider>
  )
}