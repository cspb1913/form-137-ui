"use client"

import { LoginPrompt } from "@/components/login-prompt"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me/', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.user && data.user.roles && data.user.roles.length > 0) {
            console.log('Authenticated user with roles:', data.user.roles)
            router.push('/dashboard')
            return
          }
        }
        
        // User not authenticated or no roles - show login
        setUser(null)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }
  
  // Show login prompt for unauthenticated users or users without roles
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <LoginPrompt />
    </div>
  )
}
