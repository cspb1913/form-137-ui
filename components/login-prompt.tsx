"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, LogIn } from "lucide-react"

export function LoginPrompt() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Form 137 Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Please sign in to access your Form 137 requests and dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <a href="/api/auth/login">
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </a>
          </Button>
          <div className="text-center text-sm text-gray-500">
            <p>Secure authentication powered by Auth0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
