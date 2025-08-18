"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export default function DebugDevPage() {
  const auth = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      isDevelopmentMode: process.env.NEXT_PUBLIC_DEV_MODE,
      user: auth.user,
      isLoading: auth.isLoading,
      error: auth.error,
      clientEnv: {
        NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      }
    })
  }, [auth.user, auth.isLoading, auth.error])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Development Mode Debug</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}