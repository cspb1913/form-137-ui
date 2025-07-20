const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_FORM137_API_URL || ""

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

export class DashboardAPI {
  private baseUrl: string

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl
  }
  private transformRequest(data: any): FormRequest {
    return {
      id: data.id,
      ticketNumber: data.ticketNumber,
      studentName: data.learnerName,
      studentId: data.learnerReferenceNumber,
      email: data.requesterEmail,
      phoneNumber: data.requesterPhoneNumber ?? "",
      graduationYear: data.graduationYear ?? "",
      program: data.requestType ?? "",
      purpose: data.purpose ?? "",
      deliveryMethod: (data.deliveryMethod || "").toLowerCase(),
      deliveryAddress: data.deliveryAddress ?? undefined,
      status: data.status,
      submittedAt: data.submittedDate,
      updatedAt: data.updatedDate ?? data.submittedDate,
      comments: (data.comments || []).map((c: any) => ({
        id: c.id ?? "",
        message: c.message,
        author: c.registrarName ?? "",
        createdAt: c.timestamp,
      })),
      documents: data.documents ?? [],
    }
  }
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
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
    const data = await this.makeRequest<any>("/api/dashboard/requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const requests: FormRequest[] = (data.requests || []).map((r: any) =>
      this.transformRequest(r),
    )

    const stats: DashboardStats = {
      totalRequests: data.statistics?.totalRequests ?? 0,
      pendingRequests: data.statistics?.pendingRequests ?? 0,
      completedRequests: data.statistics?.completedRequests ?? 0,
      rejectedRequests: data.statistics?.rejectedRequests ?? 0,
    }

    return { requests, stats }
  }

  async getRequestById(id: string, token: string): Promise<FormRequest> {
    const data = await this.makeRequest<any>(`/api/dashboard/request/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return this.transformRequest(data)
  }

  // Alias for backwards compatibility with older tests
  async getRequestDetails(id: string, token: string): Promise<FormRequest> {
    return this.getRequestById(id, token)
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

// Export both the class and an instance for convenience
export const dashboardApi = new DashboardAPI()
