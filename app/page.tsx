"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RequestForm137 } from "@/components/request-form-137"
import { SuccessPage } from "@/components/success-page"
import { TopNavigation } from "@/components/top-navigation"
import { BotIDProvider } from "@/components/botid-provider"
import { BotProtection } from "@/components/bot-protection"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
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
    router.push("/dashboard")
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
              <RequestForm137 onSubmit={handleFormSubmit} />
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
