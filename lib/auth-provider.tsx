"use client"

import React from "react"

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Custom auth provider for our custom Auth0 implementation
 */
export function AuthProvider({ children }: AuthProviderProps) {
  console.log("🔐 Using custom Auth0 authentication")
  
  return (
    <>
      {children}
    </>
  )
}