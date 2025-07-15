"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { ArrowLeft, Calendar, Clock, Download, FileText, Mail, MessageSquare, Phone, Send, User } from "lucide-react"
import { mockRequestDetail } from "@/lib/mock-data"
import type { RequestDetail as RequestDetailType } from "@/types/dashboard"
import Link from "next/link"
import { format } from "date-fns"

interface RequestDetailProps {
  requestId: string
}

export function RequestDetail({ requestId }: RequestDetailProps) {
  const [request, setRequest] = useState<RequestDetailType | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRequest(mockRequestDetail)
      setIsLoading(false)
    }, 1000)
  }, [requestId])

  const handleAddComment = () => {
    if (!newComment.trim() || !request) return

    const comment = {
      id: Date.now().toString(),
      author: "You",
      message: newComment,
      timestamp: new Date().toISOString(),
      isInternal: false,
    }

    setRequest({
      ...request,
      comments: [...request.comments, comment],
    })
    setNewComment("")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h2>
          <p className="text-gray-600 mb-6">The requested Form 137 request could not be found.</p>
          <Button asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.id}</h1>
            <p className="text-gray-600 mt-1">Form 137 Request Details</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{request.studentInfo.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-gray-900">{request.studentInfo.studentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Year Level</label>
                  <p className="text-gray-900">{request.studentInfo.yearLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Section</label>
                  <p className="text-gray-900">{request.studentInfo.section}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">School Year</label>
                  <p className="text-gray-900">{request.studentInfo.schoolYear}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Number</label>
                  <p className="text-gray-900">{request.studentInfo.contactNumber}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900">{request.studentInfo.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{request.studentInfo.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Purpose</label>
                  <p className="text-gray-900">{request.requestDetails.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Urgency</label>
                  <Badge variant={request.requestDetails.urgency === "Urgent" ? "destructive" : "default"}>
                    {request.requestDetails.urgency}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Number of Copies</label>
                  <p className="text-gray-900">{request.requestDetails.copies}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Method</label>
                  <p className="text-gray-900">{request.requestDetails.deliveryMethod}</p>
                </div>
              </div>
              {request.requestDetails.specialInstructions && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Special Instructions</label>
                  <p className="text-gray-900">{request.requestDetails.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Request Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={event.status} />
                        <span className="text-sm text-gray-500">{format(new Date(event.date), "MMM dd, yyyy")}</span>
                      </div>
                      <p className="text-gray-900 mt-1">{event.description}</p>
                      <p className="text-sm text-gray-500">by {event.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Comments & Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {request.comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{comment.author}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.message}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Add a comment</label>
                <Textarea
                  placeholder="Type your message here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Comment
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
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-transparent" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Request
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Update
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Pickup
              </Button>
            </CardContent>
          </Card>

          {/* Registrar Information */}
          <Card>
            <CardHeader>
              <CardTitle>Registrar Contact</CardTitle>
              <CardDescription>For questions about this request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Assigned To</label>
                <p className="text-gray-900">{request.registrarInfo.assignedTo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Office</label>
                <p className="text-gray-900">{request.registrarInfo.office}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{request.registrarInfo.contactNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{request.registrarInfo.email}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Office Hours</label>
                <p className="text-sm text-gray-900">{request.registrarInfo.officeHours}</p>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {request.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">
                            {attachment.size} • {format(new Date(attachment.uploadedDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
