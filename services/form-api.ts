import { AuthenticatedHttpClient, OptionalAuthMethod } from "@/lib/auth-http-client"

export interface FormSubmissionRequest {
  status: string
  submittedAt: string
  updatedAt: string
  notes: string
  comments: Array<{
    author: string
    message: string
    timestamp: string
  }>
  learnerReferenceNumber: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string
  lastGradeLevel: string
  lastSchoolYear: string
  previousSchool: string
  purposeOfRequest: string
  deliveryMethod: string
  estimatedCompletion: string
  requestType: string
  learnerName: string
  requesterName: string
  relationshipToLearner: string
  emailAddress: string
  mobileNumber: string
}

export interface FormSubmissionResponse {
  success: boolean
  ticketNumber: string
  message: string
  submittedAt: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: Record<string, string[]>
}

export class FormApiService {
  private httpClient: AuthenticatedHttpClient

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_FORM137_API_URL ||
      "",
  ) {
    this.httpClient = new AuthenticatedHttpClient({ baseUrl })
  }

  async submitForm(formData: FormSubmissionRequest, accessToken?: string): Promise<FormSubmissionResponse> {
    const data = await this.httpClient.post<any>("/api/form137/submit", formData, accessToken, false)

    return {
      success: data.status === "submitted",
      ticketNumber: data.ticketNumber,
      message: data.notes ?? "",
      submittedAt: data.submittedAt,
    }
  }

  async getSubmissionStatus(ticketNumber: string, accessToken?: string): Promise<{
    ticketNumber: string
    status: "pending" | "processing" | "completed" | "rejected"
    submittedAt: string
    updatedAt: string
    notes?: string
  }> {
    return this.httpClient.get<{
      ticketNumber: string
      status: "pending" | "processing" | "completed" | "rejected"
      submittedAt: string
      updatedAt: string
      notes?: string
    }>(`/api/form137/status/${ticketNumber}`, accessToken, false)
  }
}

export const formApiService = new FormApiService()
