import React, { useEffect, useState } from "react"
import type { RequestStatus } from "@/types/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

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

  useEffect(() => {
    fetch(`/api/requests/${ticketNumber}`)
      .then((res) => res.json())
      .then((data) => {
        setDetail(data.request)
        // Map status string to RequestStatus type
        const statusValue = ["submitted", "processing", "completed", "rejected"].includes(data.request.status)
          ? (data.request.status as RequestStatus)
          : "submitted"
        setStatus(statusValue)
        setComments(data.request.comments || "")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [ticketNumber])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/requests/${ticketNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comments }),
      })
      if (!res.ok) throw new Error("Failed to update request.")
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
