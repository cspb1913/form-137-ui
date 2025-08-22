import { AuthenticatedHttpClient, RequiredAuthMethod } from "@/lib/auth-http-client"

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
  status: "submitted" | "processing" | "completed" | "rejected" | "requires-clarification" | "ready-for-pickup"
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
  private httpClient: AuthenticatedHttpClient

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.httpClient = new AuthenticatedHttpClient({ baseUrl })
  }
  private transformRequest(data: any): FormRequest {
    return {
      id: data.id,
      ticketNumber: data.ticketNumber,
      studentName: data.learnerName,
      studentId: data.learnerReferenceNumber,
      email: data.requesterEmail,
      phoneNumber: data.mobileNumber ?? "",
      graduationYear: data.lastSchoolYear ?? "",
      program: data.previousSchool ?? data.lastGradeLevel ?? "",
      purpose: data.purposeOfRequest ?? "",
      deliveryMethod: (data.deliveryMethod || "").toLowerCase(),
      deliveryAddress: data.deliveryAddress ?? undefined,
      status: data.status,
      submittedAt: data.submittedAt ?? data.submittedDate ?? data.submittedAt,
      updatedAt: data.updatedAt ?? data.updatedDate ?? data.submittedAt ?? data.submittedDate,
      comments: (data.comments || []).map((c: any) => ({
        id: c.id ?? "",
        message: c.message,
        author: c.registrarName ?? "",
        createdAt: c.timestamp,
      })),
      documents: data.documents ?? [],
    }
  }
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
    return this.httpClient.request<T>(endpoint, { ...options, requireAuth: true }, accessToken)
  }

  async getDashboardData(accessToken?: string): Promise<{ requests: FormRequest[]; stats: DashboardStats }> {
    const data = await this.makeRequest<any>("/api/dashboard/requests", {}, accessToken)

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

  async getRequestById(id: string, accessToken?: string): Promise<FormRequest> {
    const data = await this.makeRequest<any>(`/api/dashboard/request/${id}`, {}, accessToken)
    return this.transformRequest(data)
  }

  // Alias for backwards compatibility with older tests
  async getRequestDetails(id: string, accessToken?: string): Promise<FormRequest> {
    return this.getRequestById(id, accessToken)
  }

  async addComment(requestId: string, message: string, accessToken?: string): Promise<Comment> {
    return this.makeRequest(`/api/dashboard/request/${requestId}/comment`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }, accessToken)
  }

  async updateRequestStatus(requestId: string, status: FormRequest["status"], accessToken?: string): Promise<FormRequest> {
    const data = await this.makeRequest<any>(`/api/dashboard/request/${requestId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, accessToken)
    return this.transformRequest(data)
  }
}

// Export both the class and an instance for convenience
export const dashboardApi = new DashboardAPI()
