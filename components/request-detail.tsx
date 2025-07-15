"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { mockRequestDetail } from "@/lib/mock-data"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

interface RequestDetailProps {
  requestId: string
}

export function RequestDetail({ requestId }: RequestDetailProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // In a real app, you would fetch the request detail based on requestId
  const request = mockRequestDetail

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setNewComment("")
    setIsSubmittingComment(false)
  }

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getTimelineColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "border-blue-200 bg-blue-50"
      case "under_review":
        return "border-yellow-200 bg-yellow-50"
      case "in_progress":
        return "border-blue-200 bg-blue-50"
      case "completed":
        return "border-green-200 bg-green-50"
      case "rejected":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
          <p className="text-gray-600">{request.id}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900">{request.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Student ID</label>
                  <p className="text-lg font-semibold text-gray-900">{request.studentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Request Type</label>
                  <p className="text-lg font-semibold text-gray-900">{request.requestType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <Badge
                    className={`${request.priority === "high" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {request.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{request.contactInfo.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{request.contactInfo.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <span>{request.contactInfo.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Purpose</label>
                  <p className="text-gray-900">{request.requestDetails.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Number of Copies</label>
                  <p className="text-gray-900">{request.requestDetails.copies}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery Method</label>
                  <p className="text-gray-900 capitalize">{request.requestDetails.deliveryMethod}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Urgent Request</label>
                  <p className="text-gray-900">{request.requestDetails.urgentRequest ? "Yes" : "No"}</p>
                </div>
              </div>
              {request.requestDetails.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Additional Notes</label>
                  <p className="text-gray-900 mt-1">{request.requestDetails.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Request Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getTimelineColor(event.status)}`}
                    >
                      {getTimelineIcon(event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(event.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">by {event.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Comments & Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Comments */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {request.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${comment.author === "Registrar Office" ? "bg-primary/5 border-l-4 border-l-primary" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.message}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* New Comment */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Add a comment</label>
                <Textarea
                  placeholder="Type your message here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmittingComment ? "Sending..." : "Send Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Mail className="mr-2 h-4 w-4" />
                Email Registrar
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Phone className="mr-2 h-4 w-4" />
                Call Office
              </Button>
            </CardContent>
          </Card>

          {/* Request Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">{format(new Date(request.submittedDate), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{format(new Date(request.lastUpdated), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <StatusBadge status={request.status} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Priority:</span>
                <Badge
                  className={`text-xs ${request.priority === "high" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                >
                  {request.priority.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paperclip className="h-4 w-4" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{attachment.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registrar Office</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>+63 2 8123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>registrar@school.edu</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <span>
                  Registrar Office, 2nd Floor
                  <br />
                  Main Building
                  <br />
                  School Campus
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Mon-Fri: 8:00 AM - 5:00 PM</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
