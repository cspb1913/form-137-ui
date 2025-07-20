"use client"

import React, { useEffect, useState } from "react"
import type { RequestStatus } from "@/types/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { dashboardApi, type FormRequest } from "@/services/dashboard-api"
import { useCurrentUser } from "@/hooks/use-current-user"

const statusOptions = ["Pending", "Processing", "Completed", "Rejected"]

interface RequestDetail {
  ticketNumber: string
  learnerReferenceNumber: string
  requesterName: string
  status: string
  submittedAt: string
  comments?: string
}

export default function AdminRequestDetail({ ticketNumber }: { ticketNumber: string }) {
  const [detail, setDetail] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<RequestStatus>("submitted")
  const [comments, setComments] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user, isLoading: userLoading } = useCurrentUser()

  useEffect(() => {
    if (userLoading) return
    
    async function loadRequest() {
      try {
        // TODO: Get proper auth token for API call
        // For now, simulate a delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // The external API requires authentication which is not set up yet
        // In a real implementation, you would call:
        // const requestDetail = await dashboardApi.getRequestById(ticketNumber, authToken)
        
        // For now, use mock data to demonstrate the intended behavior
        const mockRequests = [
          {
            ticketNumber: "REQ-2025-00001",
            learnerReferenceNumber: "123456789012",
            requesterName: "John Doe",
            status: "submitted",
            submittedAt: "2025-01-15T10:30:00Z",
            comments: "Initial submission"
          },
          {
            ticketNumber: "REQ-2025-00002",
            learnerReferenceNumber: "234567890123",
            requesterName: "Jane Smith",
            status: "processing",
            submittedAt: "2025-01-14T14:20:00Z",
            comments: "Processing started"
          },
          {
            ticketNumber: "REQ-2025-00003",
            learnerReferenceNumber: "345678901234",
            requesterName: "Bob Johnson",
            status: "completed",
            submittedAt: "2025-01-13T09:15:00Z",
            comments: "Request completed successfully"
          },
          {
            ticketNumber: "REQ-2025-00004",
            learnerReferenceNumber: "456789012345",
            requesterName: "Alice Brown",
            status: "rejected",
            submittedAt: "2025-01-12T16:45:00Z",
            comments: "Missing required documents"
          }
        ]
        
        const requestDetail = mockRequests.find(req => req.ticketNumber === ticketNumber)
        if (requestDetail) {
          setDetail(requestDetail)
          // Map status string to RequestStatus type
          const statusValue = ["submitted", "processing", "completed", "rejected"].includes(requestDetail.status)
            ? (requestDetail.status as RequestStatus)
            : "submitted"
          setStatus(statusValue)
          setComments(requestDetail.comments || "")
        }
      } catch (error) {
        console.error('Failed to load request:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadRequest()
  }, [ticketNumber, userLoading])

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Get proper auth token for API call
      // In a real implementation, you would call:
      // await dashboardApi.updateRequestStatus(detail.id, status, authToken)
      // await dashboardApi.addComment(detail.id, comments, authToken)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({ title: "Saved", description: "Request updated successfully." })
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading request...</div>
  if (!detail) return <div className="text-center py-12 text-red-500">Request not found.</div>

  // Ensure status is a valid RequestStatus for StatusBadge
  const badgeStatus: RequestStatus = ["submitted", "processing", "completed", "rejected"].includes(detail.status)
    ? (detail.status as RequestStatus)
    : "submitted"

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Request {detail.ticketNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <StatusBadge status={badgeStatus} />
          <span className="text-xs text-gray-400">Submitted: {new Date(detail.submittedAt).toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold">Requester:</div>
            <div>{detail.requesterName}</div>
            <div className="text-xs text-gray-500">LRN: {detail.learnerReferenceNumber}</div>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-semibold mb-2">Comments</label>
          <Textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4} placeholder="Add comments..." />
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-white font-semibold">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
