"use client"
export const dynamic = "force-dynamic"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Dashboard } from "@/components/dashboard"
import { TopNavigation } from "@/components/top-navigation"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/hooks/use-auth-mongodb"
import { LoginPrompt } from "@/components/login-prompt"
import { isAdmin, isRequester, canAccessDashboard } from "@/lib/user-auth-utils"

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
      // Handle users without proper roles first
      if (!canAccessDashboard(user)) {
        // Redirect users without valid roles to unauthorized page
        router.replace("/unauthorized")
        return
      }
      
      // Admin-only users go to admin panel
      if (isAdmin(user) && !isRequester(user)) {
        router.replace("/admin")
        return
      }
      
      // All other cases (Requester-only, Admin+Requester, or any valid roles) stay on dashboard
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

  // Show loading while redirecting (prevents render during redirect)
  if (!canAccessDashboard(user) || isAdmin(user)) {
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
