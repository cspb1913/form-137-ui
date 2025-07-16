"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SuccessPage } from "@/components/success-page"
import { TopNavigation } from "@/components/top-navigation"
import { BotIDProvider } from "@/components/botid-provider"
import { BotProtection } from "@/components/bot-protection"
import { RequestForm137 } from "@/components/request-form-137"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LoginPrompt } from "@/components/login-prompt"

export default function RequestPage() {
  const { user, isLoading } = useCurrentUser()
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)

  const handleFormSubmit = (ticketNumber: string) => {
    setSubmissionData({ ticketNumber })
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
    <BotIDProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <BotProtection>
          <main className="container mx-auto px-4 py-8">
            {isSubmitted ? (
              <SuccessPage
                submissionData={submissionData}
                onBackToForm={handleBackToForm}
                onGoToDashboard={handleGoToDashboard}
              />
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Form 137</h1>
                  <p className="text-gray-600">
                    Please fill out the form below to request your Form 137. All fields marked with an asterisk (*) are
                    required.
                  </p>
                </div>
                <RequestForm137 onSuccess={handleFormSubmit} />
              </div>
            )}
          </main>
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
