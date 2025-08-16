"use client"
export const dynamic = "force-dynamic"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Dashboard } from "@/components/dashboard"
import { TopNavigation } from "@/components/top-navigation"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/hooks/use-auth"
import { LoginPrompt } from "@/components/login-prompt"
import { isAdmin, canAccessDashboard } from "@/lib/auth-utils"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const handleNewRequest = () => {
    router.push("/request")
  }

  const handleViewRequest = (requestId: string) => {
    router.push(`/dashboard/request/${requestId}`)
  }

  // Role-based redirect logic
  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin(user)) {
        // Admin users should be redirected to /admin
        router.replace("/admin")
        return
      }
      // Requester users stay on this page
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <LoginPrompt />
      </div>
    )
  }

  // Handle users without proper roles
  if (!canAccessDashboard(user)) {
    // Redirect users without valid roles to unauthorized page
    router.replace("/unauthorized")
    return
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <Dashboard onNewRequest={handleNewRequest} onViewRequest={handleViewRequest} />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid #1B4332",
            color: "#1B4332",
          },
        }}
      />
    </div>
  )
}
