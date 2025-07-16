"use client"
import { useRouter } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { TopNavigation } from "@/components/top-navigation"
import { Toaster } from "@/components/ui/sonner"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LoginPrompt } from "@/components/login-prompt"

export default function HomePage() {
  const { user, isLoading } = useCurrentUser()
  const router = useRouter()

  const handleNewRequest = () => {
    router.push("/request")
  }

  const handleViewRequest = (requestId: string) => {
    router.push(`/dashboard/request/${requestId}`)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Form 137 Dashboard</h1>
          <p className="text-gray-600">Track your Form 137 requests and submit new applications.</p>
        </div>
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
