"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StatusBadge } from "@/components/status-badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, FileText, MessageSquare } from "lucide-react"
import type { FormRequest } from "@/services/dashboard-api"

interface RequesterRequestViewProps {
  request: FormRequest
}

export function RequesterRequestView({ request }: RequesterRequestViewProps) {
  // Extract form data from the request object
  const formData = {
    learnerReferenceNumber: request.studentId,
    firstName: request.studentName.split(' ')[0] || '',
    middleName: request.studentName.split(' ').slice(1, -1).join(' ') || '',
    lastName: request.studentName.split(' ').slice(-1)[0] || '',
    dateOfBirth: '', // Not available in current request object
    lastGradeLevel: '', // Not available in current request object  
    lastSchoolYear: request.graduationYear,
    previousSchool: '', // Not available in current request object
    purposeOfRequest: request.purpose,
    deliveryMethod: request.deliveryMethod,
    requesterName: request.studentName, // Assuming same for now
    relationshipToLearner: 'Self', // Default assumption
    emailAddress: request.email,
    mobileNumber: request.phoneNumber,
  }

  const gradeOptions = [
    "Nursery", "Pre-Kindergarten", "Kindergarten",
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
    "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  ]

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Form 137 Request</h1>
          <p className="text-muted-foreground">Ticket #{request.ticketNumber}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Request Timeline */}
      <Card>
        <CardContent className="pt-6">
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

      {/* Readonly Form Display */}
      <Card className="opacity-75">
        <CardHeader className="bg-muted">
          <CardTitle className="text-2xl font-bold text-center text-muted-foreground">
            Request Form 137 (Learner's Permanent Record)
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            This is a readonly view of your submitted request
          </p>
        </CardHeader>

        <CardContent className="p-6 bg-muted/30">
          <div className="space-y-6 pointer-events-none">
            {/* Learner Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground border-b border-muted pb-2">
                Learner Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">
                    Learner Reference Number
                  </Label>
                  <Input
                    value={formData.learnerReferenceNumber}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">First Name</Label>
                  <Input
                    value={formData.firstName}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Middle Name</Label>
                  <Input
                    value={formData.middleName}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Last Name</Label>
                  <Input
                    value={formData.lastName}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground border-b border-muted pb-2">
                Academic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Last Grade Level Completed</Label>
                  <Input
                    value={formData.lastGradeLevel || "Not specified"}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Last School Year Attended</Label>
                  <Input
                    value={formData.lastSchoolYear || "Not specified"}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Previous School/Campus</Label>
                  <Input
                    value={formData.previousSchool || "Not specified"}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Request Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground border-b border-muted pb-2">
                Request Details
              </h3>

              <div>
                <Label className="text-muted-foreground">Purpose of Request</Label>
                <Textarea
                  rows={3}
                  value={formData.purposeOfRequest}
                  disabled
                  className="bg-muted/50 text-muted-foreground resize-none"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Delivery Method</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-sm text-muted-foreground font-medium capitalize">
                    {formData.deliveryMethod} Only
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    All Form 137 requests must be picked up at the school office.
                  </p>
                </div>
              </div>
            </div>

            {/* Requester Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground border-b border-muted pb-2">
                Requester Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Requester Name</Label>
                  <Input
                    value={formData.requesterName}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Relationship to Learner</Label>
                  <RadioGroup
                    value={formData.relationshipToLearner}
                    className="mt-2 pointer-events-none"
                  >
                    {["Self", "Third Party"].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option} 
                          id={`readonly-relationship-${option}`}
                          disabled
                          className="text-muted-foreground"
                        />
                        <Label 
                          htmlFor={`readonly-relationship-${option}`}
                          className="text-muted-foreground"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-muted-foreground">Email Address</Label>
                  <Input
                    type="email"
                    value={formData.emailAddress}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Mobile Number</Label>
                  <Input
                    type="tel"
                    value={formData.mobileNumber}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Updates & Communications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track the progress of your request and any updates from the registrar's office
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {request.comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No updates yet.</p>
                <p className="text-sm text-muted-foreground/70">
                  You'll see any updates or communications from the registrar's office here.
                </p>
              </div>
            ) : (
              request.comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.message}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}