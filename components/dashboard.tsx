"use client"

import { useState, useEffect } from "react"
import { httpClient } from "@/lib/auth-http-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/status-badge"
import { dashboardApi, type FormRequest, type DashboardStats } from "@/services/dashboard-api"
import { Search, Filter, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Form137RequestModal } from "@/components/form-137-request-modal"

export function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [requests, setRequests] = useState<FormRequest[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<FormRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      
      // DEBUG: Dump all cookies in the console
      console.log('=== COOKIE DEBUG ===')
      console.log('All document cookies:', document.cookie)
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=')
        acc[name] = value
        return acc
      }, {} as Record<string, string>)
      console.log('Parsed cookies:', cookies)
      
      if (cookies.appSession) {
        console.log('appSession cookie found:', cookies.appSession)
        try {
          const sessionData = JSON.parse(decodeURIComponent(cookies.appSession))
          console.log('Parsed appSession:', sessionData)
          console.log('Has accessToken:', !!sessionData.accessToken)
          console.log('Has idToken:', !!sessionData.idToken) 
          console.log('Expires at:', sessionData.expiresAt ? new Date(sessionData.expiresAt) : 'No expiry')
        } catch (e) {
          console.log('Failed to parse appSession cookie:', e)
        }
      } else {
        console.log('No appSession cookie found')
      }
      console.log('=== END COOKIE DEBUG ===')
      
      // Use frontend API proxy that handles authentication with JWT tokens
      // Include credentials to send session cookies to the API proxy
      const response = await fetch('/api/dashboard/requests', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const rawData = await response.json()
      
      // Transform the raw backend data to the expected frontend format
      const transformedRequests = (rawData.requests || []).map((request: any) => ({
        id: request.id,
        ticketNumber: request.ticketNumber,
        studentName: request.learnerName,
        studentId: request.learnerReferenceNumber,
        email: request.requesterEmail,
        phoneNumber: request.mobileNumber ?? "",
        graduationYear: request.lastSchoolYear ?? "",
        program: request.previousSchool ?? request.lastGradeLevel ?? "",
        purpose: request.purposeOfRequest ?? "",
        deliveryMethod: (request.deliveryMethod || "").toLowerCase(),
        deliveryAddress: request.deliveryAddress ?? undefined,
        status: request.status,
        submittedAt: request.submittedAt ?? request.submittedDate ?? request.submittedAt,
        updatedAt: request.updatedAt ?? request.updatedDate ?? request.submittedAt ?? request.submittedDate,
        comments: (request.comments || []).map((c: any) => ({
          id: c.id ?? "",
          message: c.message,
          author: c.registrarName ?? "",
          createdAt: c.timestamp,
        })),
        documents: request.documents ?? [],
      }))
      
      setRequests(transformedRequests)
      setStats({
        totalRequests: rawData.statistics?.totalRequests ?? 0,
        pendingRequests: rawData.statistics?.pendingRequests ?? 0,
        completedRequests: rawData.statistics?.completedRequests ?? 0,
        rejectedRequests: rawData.statistics?.rejectedRequests ?? 0,
      })
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Check auth status and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const response = await fetch('/api/auth/me/', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          if (data.user) {
            await fetchDashboardData()
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setUserLoading(false)
      }
    }
    
    checkAuthAndLoadData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
  }

  const handleViewDetails = (request: FormRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRequest(null)
  }

  const handleAddComment = async (comment: string) => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/dashboard/request/${selectedRequest.id}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: comment })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const newCommentData = await response.json()
      
      // Update the selected request with the new comment
      const updatedRequest = {
        ...selectedRequest,
        comments: [
          {
            id: newCommentData.id || Date.now().toString(),
            message: comment,
            author: user?.name || "You",
            createdAt: new Date().toISOString()
          },
          ...selectedRequest.comments
        ]
      }
      
      setSelectedRequest(updatedRequest)
      
      // Update the request in the main list
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id ? updatedRequest : req
      ))
    } catch (error) {
      console.error("Failed to add comment:", error)
      throw error
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      (request.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.ticketNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.studentId?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (userLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access the dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form 137 Dashboard</h1>
          <p className="text-muted-foreground">Manage and track Form 137 requests</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/request/new">New Request</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">All time requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedRequests}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</div>
              <p className="text-xs text-muted-foreground">Rejected requests</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Latest Form 137 requests submitted by students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, ticket number, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "No requests match your search criteria."
                        : "No requests found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.ticketNumber}</TableCell>
                      <TableCell>{request.studentName}</TableCell>
                      <TableCell>{request.studentId}</TableCell>
                      <TableCell>{request.program}</TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Form137RequestModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          request={selectedRequest}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  )
}
