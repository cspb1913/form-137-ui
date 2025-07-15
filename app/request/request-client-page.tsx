"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import { RequestForm137 } from "@/components/request-form-137"
import { SuccessPage } from "@/components/success-page"
import { toast } from "@/hooks/use-toast"

export default function RequestClientPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)
  const router = useRouter()

  const handleSubmissionSuccess = (data: any) => {
    setSubmissionData(data)
    setIsSubmitted(true)

    // Show success toast
    toast({
      title: "Request Submitted Successfully",
      description: "Your Form 137 request has been submitted and is being processed.",
      duration: 5000,
    })

    // Navigate back to dashboard after a delay
    setTimeout(() => {
      router.push("/")
    }, 3000)
  }

  if (isSubmitted) {
    return <SuccessPage data={submissionData} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <main className="py-8">
        <RequestForm137 onSubmissionSuccess={handleSubmissionSuccess} />
      </main>
    </div>
  )
}
