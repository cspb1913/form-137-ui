"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useRouter } from "next/navigation"
import { dashboardApi, type FormRequest } from "@/services/dashboard-api"
import { httpClient } from "@/lib/auth-http-client"

export default function AdminRequestList() {
  const [requests, setRequests] = useState<FormRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setUserLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (userLoading) return
    
    async function loadRequests() {
      try {
        setError(null)
        if (user) {
          // Use frontend API proxy that handles authentication with JWT tokens
          const response = await fetch('/api/dashboard/requests')
          if (response.ok) {
            const data = await response.json()
            setRequests(data.requests || [])
          } else {
            throw new Error(`API error: ${response.status}`)
          }
        } else {
          setRequests([])
        }
      } catch (error) {
        console.error('Failed to load requests:', error)
        setError('Failed to load requests. Please try again.')
        setRequests([])
      } finally {
        setLoading(false)
      }
    }
    
    loadRequests()
  }, [user, userLoading])

  if (loading) {
    return <div className="text-center py-12">Loading requests...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>
  }

  return (
    <Card className="shadow-lg" data-testid="admin-request-list">
      <CardHeader>
        <CardTitle className="text-xl font-bold">All Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {requests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No requests found.</div>
          ) : (
            requests.map((req) => (
              <div
                key={req.ticketNumber}
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/admin/${req.ticketNumber}`)}
                data-testid={`admin-request-row-${req.ticketNumber}`}
              >
                <div>
                  <div className="font-semibold text-primary">{req.ticketNumber}</div>
                  <div className="text-sm text-gray-700">{req.studentName}</div>
                  <div className="text-xs text-gray-500">LRN: {req.studentId}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <span className="text-xs text-gray-400">{new Date(req.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
