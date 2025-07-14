"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import { RequestDetail } from "@/components/request-detail"
import { mockRequestDetail } from "@/lib/mock-data"
import type { RequestDetail as RequestDetailType } from "@/types/dashboard"

interface RequestDetailPageProps {
  params: {
    id: string
  }
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
  const router = useRouter()
  const [request, setRequest] = useState<RequestDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In real app, fetch request details from API
    const fetchRequest = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        setRequest(mockRequestDetail)
      } catch (error) {
        console.error("Error fetching request:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [params.id])

  const handleBack = () => {
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading request details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Request Not Found</h1>
            <p className="mt-2 text-gray-600">The requested Form 137 submission could not be found.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <RequestDetail requestId={params.id} />
      </main>
    </div>
  )
}
