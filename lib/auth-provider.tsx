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
  // Dynamically import Auth0Provider only when needed to avoid hydration issues in dev mode
  const { Auth0Provider } = require("@auth0/nextjs-auth0")
  return <Auth0Provider>{children}</Auth0Provider>
}