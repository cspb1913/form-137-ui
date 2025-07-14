"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { mockRequests } from "@/lib/mock-data"
import type { RequestStatus, RegistrarComment } from "@/types/dashboard"
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react"
import { format } from "date-fns"

interface RequestDetailProps {
  requestId: string
}

export function RequestDetail({ requestId }: RequestDetailProps) {
  const router = useRouter()
  const [request] = useState<RequestStatus | undefined>(mockRequests.find((r) => r.id === requestId))
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Request not found</h3>
          <p className="mt-1 text-sm text-gray-500">The request you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Button onClick={() => router.push("/dashboard")} className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy - h:mm a")
  }

  const getCommentIcon = (type: RegistrarComment["type"]) => {
    switch (type) {
      case "clarification-needed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "completion":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "update":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getCommentBgColor = (type: RegistrarComment["type"]) => {
    switch (type) {
      case "clarification-needed":
        return "bg-red-50 border-red-200"
      case "completion":
        return "bg-green-50 border-green-200"
      case "update":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      // In real app, call API to submit comment
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setNewComment("")
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="border-primary/30 text-primary hover:bg-primary hover:text-white bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{request.ticketNumber}</h1>
            <p className="text-sm text-gray-500">Request Details</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information */}
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
              <CardTitle className="text-primary flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Request Information
              </CardTitle>
              <CardDescription>Details about your Form 137 request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Learner Name</label>
                  <p className="text-sm font-medium">{request.learnerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">LRN</label>
                  <p className="text-sm font-medium">{request.learnerReferenceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Type</label>
                  <p className="text-sm">{request.requestType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Method</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm capitalize">{request.deliveryMethod}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Requester</label>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{request.requesterName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{request.requesterEmail}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Important Dates</label>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-xs">Submitted: {formatDate(request.submittedDate)}</span>
                    </div>
                    {request.estimatedCompletion && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs">Est. completion: {formatDate(request.estimatedCompletion)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments/Updates */}
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
              <CardTitle className="flex items-center space-x-2 text-primary">
                <MessageCircle className="h-5 w-5" />
                <span>Updates & Comments</span>
              </CardTitle>
              <CardDescription>Communication from the registrar's office</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {request.comments && request.comments.length > 0 ? (
                <div className="space-y-4">
                  {request.comments.map((comment) => (
                    <div key={comment.id} className={`rounded-lg border p-4 ${getCommentBgColor(comment.type)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">{getCommentIcon(comment.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{comment.registrarName}</p>
                            <p className="text-xs text-gray-500">{formatDate(comment.timestamp)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">{comment.message}</p>
                          {comment.requiresResponse && (
                            <div className="mt-2">
                              <Badge variant="destructive" className="text-xs">
                                Response Required
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No updates yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Updates from the registrar will appear here.</p>
                </div>
              )}

              {/* Add Comment Form */}
              {request.status === "requires-clarification" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add Response</h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your response here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] border-primary/20 focus:border-primary"
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmittingComment ? "Sending..." : "Send Response"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
              <CardTitle className="text-primary">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Request Submitted</p>
                    <p className="text-xs text-gray-500">{formatDate(request.submittedDate)}</p>
                  </div>
                </div>

                {request.status !== "submitted" && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Under Review</p>
                      <p className="text-xs text-gray-500">In progress</p>
                    </div>
                  </div>
                )}

                {(request.status === "processing" ||
                  request.status === "completed" ||
                  request.status === "ready-for-pickup") && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Processing</p>
                      <p className="text-xs text-gray-500">Document preparation</p>
                    </div>
                  </div>
                )}

                {(request.status === "completed" || request.status === "ready-for-pickup") && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ready</p>
                      <p className="text-xs text-gray-500">Available for {request.deliveryMethod}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
              <CardTitle className="text-primary text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-gray-700">{request.requesterName}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-gray-700">{request.requesterEmail}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-gray-700">+63 912 345 6789</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
              <CardTitle className="text-primary text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-primary/30 text-primary hover:bg-primary hover:text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Registrar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-primary/30 text-primary hover:bg-primary hover:text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </CardContent>
          </Card>

          {/* Action Required Alert */}
          {request.status === "requires-clarification" && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-800 text-sm flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-red-700 mb-3">
                  Your request needs additional information. Please respond to the registrar's message above.
                </p>
                <div className="text-xs text-red-600">
                  <p>
                    <strong>Contact the registrar:</strong>
                  </p>
                  <p>Email: registrar@school.edu</p>
                  <p>Phone: (02) 123-4567</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
