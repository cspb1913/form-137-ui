"use client"

import { use } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { RequestDetail } from "@/components/request-detail"

interface RequestDetailPageProps {
  params: Promise<{ id: string }>
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        <RequestDetail requestId={id} />
      </main>
    </div>
  )
}
