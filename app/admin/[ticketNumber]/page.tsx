import AdminRequestDetail from "@/components/admin-request-detail"

export default async function AdminRequestDetailPage({ params }: { params: { ticketNumber: string } }) {
  const { ticketNumber } = await params
  return <AdminRequestDetail ticketNumber={ticketNumber} />
}
