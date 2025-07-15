"use client"

import { useUser } from "@/lib/auth0-client"
import { LoginPrompt } from "@/components/login-prompt"
import { Dashboard } from "@/components/dashboard"
import { TopNavigation } from "@/components/top-navigation"
import { BotProtection } from "@/components/bot-protection"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const { user, isLoading } = useUser()

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

  if (!user) {
    return <LoginPrompt />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <BotProtection>
        <main className="container mx-auto px-4 py-8">
          <Dashboard />
        </main>
      </BotProtection>
    </div>
  )
}
