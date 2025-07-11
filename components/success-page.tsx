"use client"

import { CheckCircle, Download, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SuccessPageProps {
  ticketNumber: string
  onNewRequest: () => void
}

export function SuccessPage({ ticketNumber, onNewRequest }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-green-50 text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">Request Submitted Successfully!</CardTitle>
          </CardHeader>

          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Reference Number</h3>
              <p className="text-3xl font-bold text-primary font-mono">{ticketNumber}</p>
              <p className="text-sm text-gray-600 mt-2">Please save this reference number for tracking your request</p>
            </div>

            <div className="space-y-4 text-left">
              <h4 className="font-semibold text-gray-900">What happens next?</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email Confirmation</p>
                    <p className="text-sm text-gray-600">
                      You'll receive a confirmation email with your request details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Processing Time</p>
                    <p className="text-sm text-gray-600">Your Form 137 will be processed within 3-5 business days</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Status Updates</p>
                    <p className="text-sm text-gray-600">
                      We'll send updates to your email address as we process your request
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <Button onClick={onNewRequest} className="w-full bg-primary hover:bg-primary/90 text-white">
                Submit Another Request
              </Button>

              <p className="text-xs text-gray-500">
                For questions about your request, please contact us with your reference number: {ticketNumber}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
