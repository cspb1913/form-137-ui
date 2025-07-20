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

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

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
    const data = await this.makeRequest<any>("/api/dashboard/requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const requests: FormRequest[] = (data.requests || []).map((r: any) => ({
      id: r.id,
      ticketNumber: r.ticketNumber,
      studentName: r.learnerName,
      studentId: r.learnerReferenceNumber,
      email: r.requesterEmail,
      phoneNumber: r.requesterPhoneNumber ?? "",
      graduationYear: r.graduationYear ?? "",
      program: r.requestType ?? "",
      purpose: r.purpose ?? "",
      deliveryMethod: (r.deliveryMethod || "").toLowerCase(),
      deliveryAddress: r.deliveryAddress ?? undefined,
      status: r.status,
      submittedAt: r.submittedDate,
      updatedAt: r.updatedDate ?? r.submittedDate,
      comments: (r.comments || []).map((c: any) => ({
        id: c.id ?? "",
        message: c.message,
        author: c.registrarName ?? "",
        createdAt: c.timestamp,
      })),
      documents: r.documents ?? [],
    }))

    const stats: DashboardStats = {
      totalRequests: data.statistics?.totalRequests ?? 0,
      pendingRequests: data.statistics?.pendingRequests ?? 0,
      completedRequests: data.statistics?.completedRequests ?? 0,
      rejectedRequests: data.statistics?.rejectedRequests ?? 0,
    }

    return { requests, stats }
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

// Export both the class and an instance for convenience
export const dashboardApi = new DashboardAPI()
