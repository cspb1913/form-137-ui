"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useRouter } from "next/navigation"
import { dashboardApi, type FormRequest } from "@/services/dashboard-api"
import { useCurrentUser } from "@/hooks/use-current-user"

interface Request {
  ticketNumber: string
  learnerReferenceNumber: string
  requesterName: string
  status: string
  submittedAt: string
}

export default function AdminRequestList() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, isLoading: userLoading } = useCurrentUser()

  useEffect(() => {
    if (userLoading) return
    
    async function loadRequests() {
      try {
        if (user) {
          // TODO: Get proper auth token for API call
          // For now, simulate a delay to show loading state
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // The external API requires authentication which is not set up yet
          // In a real implementation, you would call:
          // const { requests } = await dashboardApi.getDashboardData(authToken)
          
          // For now, use mock data to demonstrate the intended behavior
          const mockRequests: Request[] = [
            {
              ticketNumber: "REQ-2025-00001",
              learnerReferenceNumber: "123456789012", 
              requesterName: "John Doe",
              status: "submitted",
              submittedAt: "2025-01-15T10:30:00Z"
            },
            {
              ticketNumber: "REQ-2025-00002",
              learnerReferenceNumber: "234567890123",
              requesterName: "Jane Smith", 
              status: "processing",
              submittedAt: "2025-01-14T14:20:00Z"
            },
            {
              ticketNumber: "REQ-2025-00003",
              learnerReferenceNumber: "345678901234",
              requesterName: "Bob Johnson",
              status: "completed", 
              submittedAt: "2025-01-13T09:15:00Z"
            },
            {
              ticketNumber: "REQ-2025-00004",
              learnerReferenceNumber: "456789012345",
              requesterName: "Alice Brown",
              status: "rejected",
              submittedAt: "2025-01-12T16:45:00Z"
            }
          ]
          setRequests(mockRequests)
        } else {
          setRequests([])
        }
      } catch (error) {
        console.error('Failed to load requests:', error)
        setRequests([])
      } finally {
        setLoading(false)
      }
    }
    
    loadRequests()
  }, [user, userLoading])

  if (loading) {
    return <div className="text-center py-12">Loading requests...</div>
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">All Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {requests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No requests found.</div>
          ) : (
            requests.map((req) => (
              <div
                key={req.ticketNumber}
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/admin/${req.ticketNumber}`)}
                data-testid={`admin-request-row-${req.ticketNumber}`}
              >
                <div>
                  <div className="font-semibold text-primary">{req.ticketNumber}</div>
                  <div className="text-sm text-gray-700">{req.requesterName}</div>
                  <div className="text-xs text-gray-500">LRN: {req.learnerReferenceNumber}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <span className="text-xs text-gray-400">{new Date(req.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
