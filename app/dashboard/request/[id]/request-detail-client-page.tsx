"use client"

import { TopNavigation } from "@/components/top-navigation"
import { RequestDetail } from "@/components/request-detail"
import { BotIDProvider } from "@/components/botid-provider"
import { BotProtection } from "@/components/bot-protection"

interface RequestDetailClientPageProps {
  requestId: string
}

export function RequestDetailClientPage({ requestId }: RequestDetailClientPageProps) {
  return (
    <BotIDProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <TopNavigation />
        <BotProtection>
          <main className="container mx-auto px-4 py-8">
            <RequestDetail requestId={requestId} />
          </main>
        </BotProtection>
      </div>
    </BotIDProvider>
  )
}

export default RequestDetailClientPage
