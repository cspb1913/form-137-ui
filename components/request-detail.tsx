"use client"

import { useState } from "react"
import { useUser, getAccessToken } from "@auth0/nextjs-auth0"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { dashboardApi, type FormRequest } from "@/services/dashboard-api"
import { Calendar, Mail, Phone, MapPin, FileText, MessageSquare, User, Clock } from "lucide-react"
import { toast } from "sonner"

interface RequestDetailProps {
  request: FormRequest
  onRequestUpdate?: (updatedRequest: FormRequest) => void
}

export function RequestDetail({ request: initialRequest, onRequestUpdate }: RequestDetailProps) {
  const { user } = useUser()
  const [request, setRequest] = useState(initialRequest)
  const [newComment, setNewComment] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    setIsAddingComment(true)
    try {
      const token = await getAccessToken({
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      })
      const comment = await dashboardApi.addComment(request.id, newComment.trim(), token)

      const updatedRequest = {
        ...request,
        comments: [...request.comments, comment],
      }

      setRequest(updatedRequest)
      setNewComment("")
      onRequestUpdate?.(updatedRequest)
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error("Failed to add comment. Please try again.")
    } finally {
      setIsAddingComment(false)
    }
  }

  const handleStatusUpdate = async (newStatus: FormRequest["status"]) => {
    if (!user) return

    setIsUpdatingStatus(true)
    try {
      const token = await getAccessToken({
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      })
      const updatedRequest = await dashboardApi.updateRequestStatus(request.id, newStatus, token)

      setRequest(updatedRequest)
      onRequestUpdate?.(updatedRequest)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status. Please try again.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
          <p className="text-muted-foreground">Ticket #{request.ticketNumber}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={request.status} />
          {user && (
            <Select value={request.status} onValueChange={handleStatusUpdate} disabled={isUpdatingStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="font-medium">{request.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                <p className="font-medium">{request.studentId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Program</label>
                <p className="font-medium">{request.program}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                <p className="font-medium">{request.graduationYear}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{request.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{request.phoneNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Purpose</label>
              <p className="font-medium">{request.purpose}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Method</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {request.deliveryMethod}
                </Badge>
              </div>
            </div>

            {request.deliveryAddress && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{request.deliveryAddress}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">Submitted</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(request.submittedAt).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(request.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {request.documents && request.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {request.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments & Updates
          </CardTitle>
          <CardDescription>Communication history for this request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment or update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim() || isAddingComment}>
                {isAddingComment ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            {request.comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No comments yet.</p>
            ) : (
              request.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
