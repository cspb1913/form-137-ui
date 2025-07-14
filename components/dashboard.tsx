"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { mockRequests, mockStatistics } from "@/lib/mock-data"
import type { RequestStatus } from "@/types/dashboard"
import { Search, FileText, Clock, CheckCircle, Users, TrendingUp, Filter, Calendar, Eye } from "lucide-react"
import { format } from "date-fns"

export function Dashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [requests] = useState<RequestStatus[]>(mockRequests)

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.learnerReferenceNumber.includes(searchTerm)

      const matchesStatus = statusFilter === "all" || request.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [requests, searchTerm, statusFilter])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy")
  }

  const handleViewRequest = (requestId: string) => {
    router.push(`/dashboard/request/${requestId}`)
  }

  const getStatusCount = (status: RequestStatus) => {
    return requests.filter((req) => req.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Form 137 Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage your document requests</p>
        </div>
        <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
          <FileText className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="text-sm font-medium text-gray-700">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStatistics.totalRequests}</div>
            <p className="text-xs text-gray-600 mt-1">All time requests</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockStatistics.pendingRequests}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStatistics.completedRequests}</div>
            <p className="text-xs text-gray-600 mt-1">Successfully processed</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-sm font-medium text-gray-700">Avg. Processing Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockStatistics.averageProcessingTime} days</div>
            <p className="text-xs text-gray-600 mt-1">Current average</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
          <CardTitle className="text-primary flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Your Requests
          </CardTitle>
          <CardDescription>View and manage all your Form 137 requests</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by learner name or ticket number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-primary/20 focus:border-primary"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] border-primary/20 focus:border-primary">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted ({getStatusCount("submitted")})</SelectItem>
                <SelectItem value="under-review">Under Review ({getStatusCount("under-review")})</SelectItem>
                <SelectItem value="processing">Processing ({getStatusCount("processing")})</SelectItem>
                <SelectItem value="requires-clarification">
                  Needs Clarification ({getStatusCount("requires-clarification")})
                </SelectItem>
                <SelectItem value="completed">Completed ({getStatusCount("completed")})</SelectItem>
                <SelectItem value="ready-for-pickup">
                  Ready for Pickup ({getStatusCount("ready-for-pickup")})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <div className="rounded-md border border-primary/20">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <TableHead className="text-primary font-semibold">Ticket Number</TableHead>
                  <TableHead className="text-primary font-semibold">Learner Name</TableHead>
                  <TableHead className="text-primary font-semibold">Status</TableHead>
                  <TableHead className="text-primary font-semibold">Submitted</TableHead>
                  <TableHead className="text-primary font-semibold">Est. Completion</TableHead>
                  <TableHead className="text-primary font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() => handleViewRequest(request.id)}
                    >
                      <TableCell className="font-medium text-primary">{request.ticketNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.learnerName}</div>
                          <div className="text-sm text-gray-500">LRN: {request.learnerReferenceNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(request.submittedDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.estimatedCompletion ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(request.estimatedCompletion)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewRequest(request.id)
                          }}
                          className="border-primary/30 text-primary hover:bg-primary hover:text-white bg-transparent"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No requests found</p>
                        <p className="text-sm text-gray-400">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Submit your first Form 137 request to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
