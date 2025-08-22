"use client"

import React from "react"
import { Auth0Provider } from '@auth0/nextjs-auth0'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Auth provider using Auth0 authentication
 */
export function AuthProvider({ children }: AuthProviderProps) {
  console.log("🔐 Using Auth0 authentication")
  
  return (
    <Auth0Provider>
      {children}
    </Auth0Provider>
  )
}