"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@auth0/nextjs-auth0"
import { LoginPrompt } from "@/components/login-prompt"
import { Dashboard } from "@/components/dashboard"
import { TopNavigation } from "@/components/top-navigation"
import { BotIDProvider } from "@/components/botid-provider"
import { BotProtection } from "@/components/bot-protection"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default async function HomePage() {
  const session = await getSession()
  const router = useRouter() // Moved useRouter to the top level

  if (!session?.user) {
    return <LoginPrompt />
  }

  const { user, isLoading } = session
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)

  const handleFormSubmit = (data: any) => {
    setSubmissionData(data)
    setIsSubmitted(true)

    // Show success toast
    toast.success("Form 137 request submitted successfully!", {
      description: "Your request has been received and is being processed.",
      duration: 5000,
    })
  }

  const handleBackToForm = () => {
    setIsSubmitted(false)
    setSubmissionData(null)
  }

  const handleGoToDashboard = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <BotIDProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <BotProtection>
          <main className="container mx-auto px-4 py-8">{isSubmitted ? <Dashboard /> : <Dashboard />}</main>
        </BotProtection>
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
    </BotIDProvider>
  )
}
