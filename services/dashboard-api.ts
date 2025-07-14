import type { RequestStatus, DashboardStatistics, Comment } from "@/types/dashboard"

export interface DashboardResponse {
  requests: RequestStatus[]
  statistics: DashboardStatistics
}

export class DashboardAPI {
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "") {
    this.baseUrl = baseUrl
  }

  async getDashboardData(token: string): Promise<DashboardResponse> {
    const response = await fetch(`${this.baseUrl}/api/dashboard/requests`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
    }

    return response.json()
  }

  async getRequestDetails(requestId: string, token: string): Promise<RequestStatus> {
    const response = await fetch(`${this.baseUrl}/api/dashboard/request/${requestId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Request not found")
      }
      throw new Error(`Failed to fetch request details: ${response.statusText}`)
    }

    return response.json()
  }

  async addComment(requestId: string, message: string, token: string): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/api/dashboard/request/${requestId}/comment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`)
    }

    return response.json()
  }

  async updateRequestStatus(requestId: string, status: string, token: string): Promise<RequestStatus> {
    const response = await fetch(`${this.baseUrl}/api/dashboard/request/${requestId}/status`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update request status: ${response.statusText}`)
    }

    return response.json()
  }
}
