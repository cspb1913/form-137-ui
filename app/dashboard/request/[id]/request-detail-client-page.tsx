"use client"

import { useEffect, useState } from "react"
import { RequestDetail } from "@/components/request-detail"
import { getRequestById } from "@/services/dashboard-api"
import type { Form137Request } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function RequestDetailClientPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<Form137Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      const fetchRequest = async () => {
        try {
          setLoading(true)
          const data = await getRequestById(params.id as string)
          setRequest(data)
        } catch (err) {
          setError("Failed to fetch request details.")
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
      fetchRequest()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!request) {
    return <div className="text-center text-gray-500">Request not found.</div>
  }

  return <RequestDetail request={request} />
}
