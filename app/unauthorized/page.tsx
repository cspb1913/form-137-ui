"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TopNavigation } from "@/components/top-navigation"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h1>
              <p className="text-gray-600 mb-6">
                You are not authorized to access this page. This could be because:
                <br />• You don't have the required role assigned
                <br />• Your account needs to be configured by an administrator
                <br />• You're trying to access admin features without admin privileges
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">
                    Return to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <a href="/api/auth/logout">
                    Sign Out
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}