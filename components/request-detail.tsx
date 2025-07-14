"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, FileText, MessageSquare, Send, User, ArrowLeft, Download, Eye } from "lucide-react"
import { StatusBadge } from "./status-badge"
import type { FormRequest } from "@/types/dashboard"
import Link from "next/link"

interface RequestDetailProps {
  request: FormRequest
}

export function RequestDetail({ request }: RequestDetailProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(request.comments || [])

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: "You",
        content: newComment,
        timestamp: new Date().toISOString(),
        isFromRegistrar: false,
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600"
      case "in_progress":
        return "text-blue-600"
      case "pending":
        return "text-yellow-600"
      case "rejected":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 text-green-700 hover:text-green-800 hover:bg-green-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-800">Request Details</h1>
              <p className="text-green-600 mt-1">Request ID: {request.id}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Information */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Request Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg text-gray-900">{request.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-lg text-gray-900">{request.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Purpose</label>
                    <p className="text-lg text-gray-900">{request.purpose}</p>
                  </div>
                  {request.additionalNotes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Additional Notes</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{request.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Request Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Request Submitted</p>
                      <p className="text-sm text-gray-600">{formatDate(request.submittedAt)}</p>
                    </div>
                  </div>
                  {request.status !== "pending" && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Under Review</p>
                        <p className="text-sm text-gray-600">Being processed by registrar</p>
                      </div>
                    </div>
                  )}
                  {request.status === "completed" && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Completed</p>
                        <p className="text-sm text-gray-600">Form 137 is ready for pickup</p>
                      </div>
                    </div>
                  )}
                  {request.status === "rejected" && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Request Rejected</p>
                        <p className="text-sm text-gray-600">Please check comments for details</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.isFromRegistrar ? "/placeholder-user.jpg" : undefined} />
                          <AvatarFallback
                            className={
                              comment.isFromRegistrar ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                            }
                          >
                            {comment.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{comment.author}</p>
                            {comment.isFromRegistrar && (
                              <Badge variant="secondary" className="text-xs">
                                Registrar
                              </Badge>
                            )}
                            <p className="text-xs text-gray-500">{formatDate(comment.timestamp)}</p>
                          </div>
                          <p className="text-gray-700 mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Add a comment</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] border-green-200 focus:border-green-500"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {request.status === "completed" && (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Download className="mr-2 h-4 w-4" />
                      Download Form 137
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Submitted Documents
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Request Summary */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="text-sm text-gray-900">{new Date(request.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <Badge
                      variant={
                        request.priority === "high"
                          ? "destructive"
                          : request.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {request.priority}
                    </Badge>
                  </div>
                  {request.estimatedCompletion && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Est. Completion:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(request.estimatedCompletion).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Contact Registrar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Office Hours:</strong>
                  </p>
                  <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p>
                    <strong>Phone:</strong> (02) 8123-4567
                  </p>
                  <p>
                    <strong>Email:</strong> registrar@school.edu.ph
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Named export for the component
