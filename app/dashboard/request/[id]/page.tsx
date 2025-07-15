import { getSession } from "@auth0/nextjs-auth0"
import { LoginPrompt } from "@/components/login-prompt"
import { RequestDetailClientPage } from "./request-detail-client-page"

interface RequestDetailPageProps {
  params: {
    id: string
  }
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const session = await getSession()

  if (!session?.user) {
    return <LoginPrompt />
  }

  return <RequestDetailClientPage requestId={params.id} />
}
