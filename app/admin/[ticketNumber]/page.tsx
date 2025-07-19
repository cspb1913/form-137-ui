import AdminRequestDetail from "@/components/admin-request-detail"

export default function AdminRequestDetailPage({ params }: { params: { ticketNumber: string } }) {
  return <AdminRequestDetail ticketNumber={params.ticketNumber} />
}
