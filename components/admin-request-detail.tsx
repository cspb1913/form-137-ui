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
import { useUser, getAccessToken } from "@auth0/nextjs-auth0"

const statusOptions = ["Pending", "Processing", "Completed", "Rejected"]

export default function AdminRequestDetail({ ticketNumber }: { ticketNumber: string }) {
  const [detail, setDetail] = useState<FormRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<RequestStatus>("submitted")
  const [comments, setComments] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user, isLoading: userLoading } = useUser()

  useEffect(() => {
    if (userLoading) return
    
    async function loadRequest() {
      try {
        setError(null)
        if (user) {
          const token = await getAccessToken({
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          })
          // Find the request by ticket number from the API
          const { requests } = await dashboardApi.getDashboardData(token)
          const requestDetail = requests.find(req => req.ticketNumber === ticketNumber)
          
          if (requestDetail) {
            setDetail(requestDetail)
            setStatus(requestDetail.status as RequestStatus)
            // Use the latest comment if any
            const latestComment = requestDetail.comments[requestDetail.comments.length - 1]
            setComments(latestComment?.message || "")
          } else {
            setError("Request not found.")
          }
        }
      } catch (error) {
        console.error('Failed to load request:', error)
        setError('Failed to load request. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    loadRequest()
  }, [ticketNumber, userLoading, user])

  const handleSave = async () => {
    if (!detail || !user) return
    
    setSaving(true)
    try {
      const token = await getAccessToken({
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      })
      
      // Update status if changed
      if (status !== detail.status) {
        await dashboardApi.updateRequestStatus(detail.id, status, token)
      }
      
      // Add comment if provided
      if (comments.trim()) {
        await dashboardApi.addComment(detail.id, comments, token)
      }
      
      toast({ title: "Saved", description: "Request updated successfully." })
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading request...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>
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
            <div className="font-semibold">Student:</div>
            <div>{detail.studentName}</div>
            <div className="text-xs text-gray-500">Student ID: {detail.studentId}</div>
          </div>
          <div>
            <div className="font-semibold">Contact:</div>
            <div>{detail.email}</div>
            <div className="text-xs text-gray-500">Phone: {detail.phoneNumber}</div>
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
