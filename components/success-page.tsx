"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, User, Mail, Phone, MapPin, Calendar, ArrowLeft, BarChart3 } from "lucide-react"

interface SuccessPageProps {
  submissionData: {
    ticketNumber: string
    learnerName: string
    learnerReferenceNumber: string
    requesterName: string
    requesterEmail: string
    mobileNumber: string
    deliveryMethod: string
    estimatedCompletion: string
  }
  onBackToForm: () => void
  onGoToDashboard: () => void
}

export function SuccessPage({ submissionData, onBackToForm, onGoToDashboard }: SuccessPageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-green-800">Request Submitted Successfully!</h1>
              <p className="text-green-700 mt-1">Your Form 137 request has been received and is being processed.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Details */}
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
          <CardTitle className="text-primary flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Request Details
          </CardTitle>
          <CardDescription>Your submission information and tracking details</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ticket Number</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                    {submissionData.ticketNumber}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Learner Information</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{submissionData.learnerName}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">LRN: {submissionData.learnerReferenceNumber}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Delivery Method</label>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm capitalize">{submissionData.deliveryMethod}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Requester Information</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{submissionData.requesterName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{submissionData.requesterEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{submissionData.mobileNumber}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Estimated Completion</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(submissionData.estimatedCompletion)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
          <CardTitle className="text-primary">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Track Your Request</h4>
                <p className="text-sm text-gray-600">
                  Use your ticket number to track the status of your request.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">
                  You'll receive email updates at <strong>{submissionData.requesterEmail}</strong> about your request
                  status.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Document Pickup/Delivery</h4>
                <p className="text-sm text-gray-600">
                  {submissionData.deliveryMethod === "pickup"
                    ? "You will be notified when your document is ready for pickup at the registrar office."
                    : "Your document will be mailed to your provided address once ready."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onBackToForm}
          className="border-primary/30 text-primary hover:bg-primary hover:text-white bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Submit Another Request
        </Button>
        <Button onClick={onGoToDashboard} className="bg-primary hover:bg-primary/90">
          <BarChart3 className="mr-2 h-4 w-4" />
          View Dashboard
        </Button>
      </div>

      {/* Contact Information */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have questions about your request, contact the registrar office:
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📧 Email: registrar@school.edu</p>
              <p>📞 Phone: (02) 123-4567</p>
              <p>🕒 Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
