"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import { RequestForm137 } from "@/components/request-form-137"
import { BotProtection } from "@/components/bot-protection"
import { toast } from "sonner"

export default function NewRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSuccess = (ticketNumber: string) => {
    toast.success(`Form 137 request submitted successfully! Ticket #${ticketNumber}`)
    router.push("/dashboard")
  }

  const handleSubmissionStart = () => {
    setIsSubmitting(true)
  }

  const handleSubmissionEnd = () => {
    setIsSubmitting(false)
  }

  return (
    <BotProtection>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <TopNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Request Form 137</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Submit your request for Form 137 (Permanent Record). Please fill out all required fields accurately.
              </p>
            </div>

            <RequestForm137
              onSuccess={handleSuccess}
              onSubmissionStart={handleSubmissionStart}
              onSubmissionEnd={handleSubmissionEnd}
              disabled={isSubmitting}
            />
          </div>
        </main>
      </div>
    </BotProtection>
  )
}