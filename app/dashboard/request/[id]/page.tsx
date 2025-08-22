"use client"
export const dynamic = "force-dynamic"

import { httpClient } from "@/lib/auth-http-client"
import { useState, useEffect } from "react"
import { LoginPrompt } from "@/components/login-prompt"
import RequestDetailClientPage from "./request-detail-client-page"

interface RequestDetailPageProps {
  params: {
    id: string
  }
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await httpClient.get('/api/auth/me')
        setUser(userData)
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (isLoading) {
    return null
  }

  if (!user) {
    return <LoginPrompt />
  }

  return <RequestDetailClientPage requestId={params.id} />
}
