"use client"

import { useEffect, useState } from "react"
import { RequestDetail } from "@/components/request-detail"
import { getRequestById } from "@/services/dashboard-api"
import type { Form137Request } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface RequestDetailClientPageProps {
  requestId: string
}

export function RequestDetailClientPage({ requestId }: RequestDetailClientPageProps) {
  const [request, setRequest] = useState<Form137Request | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setIsLoading(true)
        const data = await getRequestById(requestId)
        setRequest(data)
      } catch (err) {
        setError("Failed to load request details.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [requestId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!request) {
    return <div>Request not found.</div>
  }

  return <RequestDetail request={request} />
}

export default RequestDetailClientPage
