"use client"

import { TopNavigation } from "@/components/top-navigation"
import { RequestDetail } from "@/components/request-detail"

interface RequestDetailClientPageProps {
  requestId: string
}

const RequestDetailClientPage = ({ requestId }: RequestDetailClientPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <main className="py-8">
        <RequestDetail requestId={requestId} />
      </main>
    </div>
  )
}

export default RequestDetailClientPage
