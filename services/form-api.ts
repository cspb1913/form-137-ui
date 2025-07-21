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
  private baseUrl: string

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_FORM137_API_URL ||
      "",
  ) {
    this.baseUrl = baseUrl
  }

  async submitForm(formData: FormSubmissionRequest): Promise<FormSubmissionResponse> {
    const response = await fetch(`${this.baseUrl}/api/form137/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(`API Error: ${errorData.message}`)
    }

    const data = await response.json()

    return {
      success: data.status === "submitted",
      ticketNumber: data.ticketNumber,
      message: data.notes ?? "",
      submittedAt: data.submittedAt,
    }
  }

  async getSubmissionStatus(ticketNumber: string): Promise<{
    ticketNumber: string
    status: "pending" | "processing" | "completed" | "rejected"
    submittedAt: string
    updatedAt: string
    notes?: string
  }> {
    const response = await fetch(`${this.baseUrl}/api/form137/status/${ticketNumber}`)

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(`API Error: ${errorData.message}`)
    }

    return await response.json()
  }
}

export const formApiService = new FormApiService()
