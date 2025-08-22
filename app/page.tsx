"use client"

import { useUser } from '@auth0/nextjs-auth0'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginPrompt } from "@/components/login-prompt"

export default function HomePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If authenticated user, will redirect via useEffect - show loading for now
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }
  
  // If not authenticated, show login prompt
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <LoginPrompt />
    </div>
  )
}
