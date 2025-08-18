import AdminRequestDetail from "@/components/admin-request-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AdminRequestDetailPage({ params }: { params: { ticketNumber: string } }) {
  const { ticketNumber } = await params
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <AdminRequestDetail ticketNumber={ticketNumber} />
    </div>
  )
}
