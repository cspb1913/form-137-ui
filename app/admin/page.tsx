import AdminRequestList from "@/components/admin-request-list"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Admin Requests</h1>
        <AdminRequestList />
      </div>
    </div>
  )
}
