const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_FORM137_API_URL ||
  ""

export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  rejectedRequests: number
}

export interface FormRequest {
  id: string
  ticketNumber: string
  studentName: string
  studentId: string
  email: string
  phoneNumber: string
  graduationYear: string
  program: string
  purpose: string
  deliveryMethod: "pickup" | "email" | "mail"
  deliveryAddress?: string
  status: "pending" | "processing" | "completed" | "rejected"
  submittedAt: string
  updatedAt: string
  comments: Comment[]
  documents: Document[]
}

export interface Comment {
  id: string
  message: string
  author: string
  createdAt: string
}

export interface Document {
  id: string
  name: string
  url: string
  uploadedAt: string
}

class DashboardApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getDashboardData(token: string): Promise<{ requests: FormRequest[]; stats: DashboardStats }> {
    return this.makeRequest("/api/dashboard/requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getRequestById(id: string, token: string): Promise<FormRequest> {
    return this.makeRequest(`/api/dashboard/request/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async addComment(requestId: string, message: string, token: string): Promise<Comment> {
    return this.makeRequest(`/api/dashboard/request/${requestId}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    })
  }

  async updateRequestStatus(requestId: string, status: FormRequest["status"], token: string): Promise<FormRequest> {
    return this.makeRequest(`/api/dashboard/request/${requestId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
  }
}

export const dashboardApi = new DashboardApiService()
