"use client"

import { RequestDetailComponent } from "@/components/request-detail"
import TopNavigation from "@/components/top-navigation"
import { mockRequestDetails } from "@/lib/mock-data"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import type { RequestDetail } from "@/types/dashboard"

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<RequestDetail | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const foundRequest = mockRequestDetails.find((r) => r.id === params.id)
    setRequest(foundRequest)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
        <TopNavigation />
        <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (!request) {
    notFound()
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
      <TopNavigation />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <RequestDetailComponent request={request} />
      </main>
    </div>
  )
}
