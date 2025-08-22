"use client"

import React, { useState } from "react"
import { FormRequest } from "@/services/dashboard-api"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { 
  User, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  GraduationCap,
  BookOpen,
  Target,
  Truck
} from "lucide-react"
import { toast } from "sonner"

interface Form137RequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: FormRequest
  onAddComment: (comment: string) => Promise<void>
}

export function Form137RequestModal({ 
  isOpen, 
  onClose, 
  request, 
  onAddComment 
}: Form137RequestModalProps) {
  const [newComment, setNewComment] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsAddingComment(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment("")
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error("Failed to add comment. Please try again.")
    } finally {
      setIsAddingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Form 137 Request Details
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  Ticket #{request.ticketNumber}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
            <div className="px-6 py-6 space-y-6">
              {/* Student Information Section */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </label>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {request.studentName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Student ID
                      </label>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {request.studentId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Program/Course
                      </label>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.program}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Graduation Year
                      </label>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.graduationYear}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.phoneNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Request Details Section */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Purpose of Request
                    </label>
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-muted-foreground mt-1" />
                      <p className="text-sm leading-relaxed">{request.purpose}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Delivery Method
                    </label>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="capitalize font-medium">
                        {request.deliveryMethod}
                      </Badge>
                    </div>
                  </div>

                  {request.deliveryAddress && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Delivery Address
                      </label>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">
                          {request.deliveryAddress}
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Date Submitted
                      </label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(request.submittedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(request.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Section */}
              {request.documents && request.documents.length > 0 && (
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {request.documents.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(doc.uploadedAt)}
                            </p>
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

              {/* Comments Section */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                    Comments & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Comment Form */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      Add a comment
                    </label>
                    <Textarea
                      placeholder="Enter your comment here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment} 
                        disabled={!newComment.trim() || isAddingComment}
                        size="sm"
                      >
                        {isAddingComment ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Comment History ({request.comments.length})
                    </h4>
                    
                    {request.comments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No comments yet.</p>
                        <p className="text-sm">Be the first to add a comment!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {request.comments
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((comment) => (
                            <div 
                              key={comment.id} 
                              className="bg-muted/30 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-medium text-sm">
                                    {comment.author}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed pl-10">
                                {comment.message}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}