"use client"

import { useState } from "react"
import { RequestForm137 } from "@/components/request-form-137"
import { SuccessPage } from "@/components/success-page"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")

  const handleSuccess = (ticket: string) => {
    setTicketNumber(ticket)
    setIsSuccess(true)
  }

  const handleNewRequest = () => {
    setIsSuccess(false)
    setTicketNumber("")
  }

  return (
    <>
      {isSuccess ? (
        <SuccessPage ticketNumber={ticketNumber} onNewRequest={handleNewRequest} />
      ) : (
        <RequestForm137 onSuccess={handleSuccess} />
      )}
      <Toaster />
    </>
  )
}
