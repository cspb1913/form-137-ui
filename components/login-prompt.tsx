"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, LogIn, Shield, Users } from "lucide-react"

export function LoginPrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Form 137 Portal</h1>
          <p className="mt-2 text-gray-600">Learner's Permanent Record Request System</p>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-primary">Welcome Back</CardTitle>
            <CardDescription>Please sign in to access your dashboard and manage your Form 137 requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure authentication with Auth0</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FileText className="h-4 w-4 text-primary" />
                <span>Track your Form 137 requests</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-primary" />
                <span>Communicate with registrar office</span>
              </div>
            </div>

            <Button asChild className="w-full bg-primary hover:bg-primary/90" size="lg">
              <a href="/api/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Continue
              </a>
            </Button>

            <div className="text-center text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          Need help? Contact the registrar office at{" "}
          <a href="mailto:registrar@school.edu" className="text-primary hover:underline">
            registrar@school.edu
          </a>
        </div>
      </div>
    </div>
  )
}
