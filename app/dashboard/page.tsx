"use client"

import { Dashboard } from "@/components/dashboard"
import { TopNavigation } from "@/components/top-navigation"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  )
}
