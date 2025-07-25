"use client"
export const dynamic = "force-dynamic"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AdminRequestList from "@/components/admin-request-list"
import { TopNavigation } from "@/components/top-navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { canAccessAdmin } from "@/lib/auth-utils"

export default function AdminPage() {
  const { user, isLoading } = useCurrentUser()
  const router = useRouter()

  // Role-based access control
  useEffect(() => {
    if (!isLoading && user) {
      if (!canAccessAdmin(user)) {
        // Redirect non-admin users to unauthorized page
        router.replace("/unauthorized")
        return
      }
    }
  }, [user, isLoading, router])

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/api/auth/login?returnTo=/admin")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <TopNavigation />
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <TopNavigation />
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-gray-600">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!canAccessAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <TopNavigation />
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-gray-600">Redirecting...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <TopNavigation />
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Admin Requests</h1>
        <AdminRequestList />
      </div>
    </div>
  )
}
