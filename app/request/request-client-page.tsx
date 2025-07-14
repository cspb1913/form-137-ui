"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RequestForm137 } from "@/components/request-form-137"
import { SuccessPage } from "@/components/success-page"
import { BotProtection } from "@/components/bot-protection"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export default function RequestClientPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)

  const handleFormSubmit = (data: any) => {
    setSubmissionData(data)
    setIsSubmitted(true)
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

  return (
    <BotProtection>
      {isSubmitted ? (
        <SuccessPage
          submissionData={submissionData}
          onBackToForm={handleBackToForm}
          onGoToDashboard={handleGoToDashboard}
        />
      ) : (
        <RequestForm137 onSubmit={handleFormSubmit} />
      )}
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
    </BotProtection>
  )
}
