import { getSession } from "@auth0/nextjs-auth0"
import { LoginPrompt } from "@/components/login-prompt"
import { TopNavigation } from "@/components/top-navigation"
import RequestDetailClientPage from "./request-detail-client-page"

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        {session?.user ? <RequestDetailClientPage params={params} /> : <LoginPrompt />}
      </main>
    </div>
  )
}
