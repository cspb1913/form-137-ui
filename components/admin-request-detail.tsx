"use client"

"use client"

import React, { useEffect, useState } from "react"
import type { RequestStatus } from "@/types/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { dashboardApi, type FormRequest } from "@/services/dashboard-api"
import { useUser } from "@auth0/nextjs-auth0"
import { useGetAuth0Token } from "@/hooks/use-auth0-token"
import { User, FileText, Mail, Phone, Calendar, Clock, MessageSquare, AlertCircle, MapPin } from "lucide-react"

const statusOptions = [
  { label: "Submitted", value: "submitted" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Ready for Pickup", value: "ready-for-pickup" },
  { label: "Rejected", value: "rejected" },
  { label: "Requires Clarification", value: "requires-clarification" },
]

export default function AdminRequestDetail({ ticketNumber }: { ticketNumber: string }) {
  const [detail, setDetail] = useState<FormRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<RequestStatus>("submitted")
  const [comments, setComments] = useState("")
  const [saving, setSaving] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, isLoading: userLoading } = useUser()
  const getToken = useGetAuth0Token()

  useEffect(() => {
    if (userLoading) return
    
    async function loadRequest() {
      try {
        setError(null)
        if (user) {
          const token = await getToken()
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
      const token = await getToken()
      let updatedDetail = { ...detail }
      
      // Update status if changed
      if (status !== detail.status) {
        updatedDetail = await dashboardApi.updateRequestStatus(detail.id, status, token)
        setDetail(updatedDetail)
      }
      
      // Add comment if provided
      if (comments.trim()) {
        const newComment = await dashboardApi.addComment(detail.id, comments, token)
        
        // Update the detail with the new comment at the beginning (most recent first)
        const updatedComments = [newComment, ...updatedDetail.comments]
        updatedDetail = {
          ...updatedDetail,
          comments: updatedComments
        }
        setDetail(updatedDetail)
        setComments("") // Clear the comment input after successful save
        
        // Set the just added comment for animation
        setJustAdded(newComment.id)
        setTimeout(() => setJustAdded(null), 2000) // Remove highlight after 2 seconds
      }
      
      toast({ title: "Saved", description: "Request updated successfully." })
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  if (!detail) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Request not found. It may have been deleted or you don't have permission to view it.</AlertDescription>
      </Alert>
    )
  }

  // Ensure status is a valid RequestStatus for StatusBadge
  const badgeStatus: RequestStatus = ["submitted", "processing", "completed", "rejected"].includes(detail.status)
    ? (detail.status as RequestStatus)
    : "submitted"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
          <p className="text-muted-foreground">Ticket #{detail.ticketNumber}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={badgeStatus} />
          <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)} disabled={saving}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="font-medium mt-1">{detail.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                <p className="font-medium mt-1">{detail.studentId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Grade Level</label>
                <p className="font-medium mt-1">{detail.program || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last School Year</label>
                <p className="font-medium mt-1">{detail.graduationYear || 'Not specified'}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{detail.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{detail.phoneNumber || 'Not provided'}</span>
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
              <p className="font-medium mt-1">{detail.purpose || 'Not specified'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Method</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {detail.deliveryMethod || 'pickup'}
                </Badge>
              </div>
            </div>

            {detail.deliveryAddress && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{detail.deliveryAddress}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(detail.submittedAt).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(detail.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {detail.documents && detail.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detail.documents.map((doc) => (
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
          <CardDescription>Communication history and admin actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <label className="text-sm font-medium text-blue-900">Add Comment</label>
            </div>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Add a comment or update..."
              className="transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleSave} 
                disabled={saving || (!comments.trim() && status === detail?.status)} 
                className="transition-all duration-200 ease-in-out transform hover:scale-105 disabled:hover:scale-100"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
              {comments.trim() && (
                <span className="text-xs text-muted-foreground bg-white px-2 py-1 rounded-full">
                  {comments.trim().length} characters
                </span>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Comment History</h4>
            {detail.comments.length === 0 ? (
              <div className="text-muted-foreground text-center py-8 transition-all duration-300 ease-in-out">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...detail.comments]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((comment, index) => (
                    <div 
                      key={comment.id} 
                      className={`flex gap-3 p-4 rounded-lg transform transition-all duration-500 ease-in-out hover:scale-[1.01] animate-in slide-in-from-top-2 fade-in ${
                        justAdded === comment.id 
                          ? 'bg-green-50 border-2 border-green-200 shadow-lg' 
                          : 'bg-muted/50 hover:bg-muted/70'
                      }`}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animationDuration: '600ms'
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          {(index === 0 || justAdded === comment.id) && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              justAdded === comment.id 
                                ? 'bg-green-200 text-green-800 animate-bounce' 
                                : 'bg-green-100 text-green-700 animate-pulse'
                            }`}>
                              {justAdded === comment.id ? 'New!' : 'Latest'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed break-words">{comment.message}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
