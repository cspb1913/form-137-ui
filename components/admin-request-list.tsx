import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useRouter } from "next/navigation"

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

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
