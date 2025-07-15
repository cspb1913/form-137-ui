import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, Clock, CheckCircle } from "lucide-react"

export function LoginPrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Form 137 Request Portal</h1>
          <p className="text-xl text-gray-600">Secure access to your academic records</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your Form 137 requests and track their status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full" size="lg">
                  <a href="/auth/login">Sign In to Continue</a>
                </Button>
                <p className="text-sm text-gray-500 text-center">Secure authentication powered by Auth0</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Secure & Private</h3>
                <p className="text-gray-600">Your personal information is protected with enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Real-time Tracking</h3>
                <p className="text-gray-600">Monitor the status of your Form 137 requests in real-time</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Easy Process</h3>
                <p className="text-gray-600">Submit requests quickly with our streamlined digital process</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
