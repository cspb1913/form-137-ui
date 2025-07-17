"use client"
export const dynamic = "force-dynamic"

import { useCurrentUser } from "@/hooks/use-current-user"
import { LoginPrompt } from "@/components/login-prompt"
import RequestDetailClientPage from "./request-detail-client-page"

interface RequestDetailPageProps {
  params: {
    id: string
  }
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { user, isLoading } = useCurrentUser()

  if (isLoading) {
    return null
  }

  if (!user) {
    return <LoginPrompt />
  }

  return <RequestDetailClientPage requestId={params.id} />
}
