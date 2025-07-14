"use client"

import { useState } from "react"
import { RequestForm137 } from "@/components/request-form-137"
import { SuccessPage } from "@/components/success-page"
import { BotProtection } from "@/components/bot-protection"

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")

  const handleSuccess = (ticket: string) => {
    setTicketNumber(ticket)
    setIsSubmitted(true)
  }

  const handleBackToForm = () => {
    setIsSubmitted(false)
    setTicketNumber("")
  }

  return (
    <BotProtection blockBots={true} showWarning={true}>
      {isSubmitted ? (
        <SuccessPage ticketNumber={ticketNumber} onBackToForm={handleBackToForm} />
      ) : (
        <RequestForm137 onSuccess={handleSuccess} />
      )}
    </BotProtection>
  )
}
