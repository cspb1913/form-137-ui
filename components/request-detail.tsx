"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Mail, MessageSquare, Phone, Send, User, Clock, CheckCircle, XCircle, Archive } from "lucide-react"
import type { RequestDetailData } from "@/types/dashboard"
import { StatusBadge } from "@/components/status-badge"

const timelineEvents = [
  {
    status: "Completed",
    date: "2023-10-27T10:00:00Z",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    description: "Request fulfilled and documents sent.",
  },
  {
    status: "In Progress",
    date: "2023-10-26T14:30:00Z",
    icon: <Clock className="h-5 w-5 text-yellow-500" />,
    description: "Registrar is processing the request.",
  },
  {
    status: "Submitted",
    date: "2023-10-25T09:00:00Z",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    description: "Request submitted successfully.",
  },
]

const comments = [
  {
    author: "Registrar's Office",
    avatar: "/placeholder-logo.png",
    text: "We have received your request. Please allow 3-5 business days for processing. We have a high volume of requests at the moment.",
    timestamp: "2 days ago",
  },
  {
    author: "Jason Calalang",
    avatar: "/placeholder-user.jpg",
    text: "Thank you for the update. I'll wait for the documents.",
    timestamp: "1 day ago",
  },
]

export function RequestDetail({ request }: { request: RequestDetailData }) {
  const [newComment, setNewComment] = useState("")
  const [commentsList, setCommentsList] = useState(request.comments || [])

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: "You",
        content: newComment,
        timestamp: new Date().toISOString(),
        isFromRegistrar: false,
      }
      setCommentsList([...commentsList, comment])
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
    <div className="grid md:grid-cols-3 gap-8 p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="md:col-span-2 space-y-8">
        {/* Request Header */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-green-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                  Request ID: {request.id}
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Form 137 Request for {request.studentName}
                </CardDescription>
              </div>
              <StatusBadge status={request.status} />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Date Submitted:</p>
              <p className="text-gray-600 dark:text-gray-400">{request.dateSubmitted}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Last Updated:</p>
              <p className="text-gray-600 dark:text-gray-400">{request.lastUpdated}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Purpose:</p>
              <p className="text-gray-600 dark:text-gray-400">{request.purpose}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Destination School:</p>
              <p className="text-gray-600 dark:text-gray-400">{request.destinationSchool}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Request Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-4 mb-6 last:mb-0">
                  <div className="z-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full h-10 w-10 ring-4 ring-white dark:ring-gray-800">
                    {event.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{event.status}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(event.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comments/Communication */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Communication Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {commentsList.map((comment, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{comment.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                      {formatDate(comment.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="Jason Calalang" />
                <AvatarFallback>JC</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your message to the registrar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full pr-12"
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 bg-green-700 hover:bg-green-800"
                  onClick={handleAddComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-8">
        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button variant="outline" className="justify-start bg-transparent">
              <MessageSquare className="mr-2 h-4 w-4" /> Send a Follow-up
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" /> View Submitted Docs
            </Button>
            <Button
              variant="outline"
              className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 bg-transparent"
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel Request
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <Archive className="mr-2 h-4 w-4" /> Archive Request
            </Button>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Registrar Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Ms. Jane Doe</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <a href="mailto:registrar@school.edu" className="text-green-700 hover:underline dark:text-green-500">
                registrar@school.edu
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">(123) 456-7890</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Named export for the component
export default RequestDetail
