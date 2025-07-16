"use client"

import { useState, useEffect } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { RequestDetail } from "@/components/request-detail"
import { dashboardApi, type FormRequest } from "@/services/dashboard-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface RequestDetailClientPageProps {
  requestId: string
}

export default function RequestDetailClientPage({ requestId }: RequestDetailClientPageProps) {
  const { user, isLoading: userLoading, getAccessTokenSilently } = useUser()
  const [request, setRequest] = useState<FormRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!user || userLoading) return

      try {
        setError(null)
        const token = await getAccessTokenSilently()
        const requestData = await dashboardApi.getRequestById(requestId, token)
        setRequest(requestData)
      } catch (err) {
        console.error("Failed to fetch request:", err)
        setError("Failed to load request details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (!userLoading) {
      fetchRequest()
    }
  }, [requestId, user, userLoading, getAccessTokenSilently])

  const handleRequestUpdate = (updatedRequest: FormRequest) => {
    setRequest(updatedRequest)
  }

  if (userLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view request details.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Request not found. It may have been deleted or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <RequestDetail request={request} onRequestUpdate={handleRequestUpdate} />
    </div>
  )
}
