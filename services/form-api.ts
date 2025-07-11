export interface FormSubmissionRequest {
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
  requesterName: string
  relationshipToLearner: string
  emailAddress: string
  mobileNumber: string
  validId: File
  authorizationLetter?: File
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

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001") {
    this.baseUrl = baseUrl
  }

  async submitForm(formData: FormSubmissionRequest): Promise<FormSubmissionResponse> {
    const formDataPayload = new FormData()

    // Add all text fields
    formDataPayload.append("learnerReferenceNumber", formData.learnerReferenceNumber)
    formDataPayload.append("firstName", formData.firstName)
    if (formData.middleName) {
      formDataPayload.append("middleName", formData.middleName)
    }
    formDataPayload.append("lastName", formData.lastName)
    formDataPayload.append("dateOfBirth", formData.dateOfBirth)
    formDataPayload.append("lastGradeLevel", formData.lastGradeLevel)
    formDataPayload.append("lastSchoolYear", formData.lastSchoolYear)
    formDataPayload.append("previousSchool", formData.previousSchool)
    formDataPayload.append("purposeOfRequest", formData.purposeOfRequest)
    formDataPayload.append("deliveryMethod", formData.deliveryMethod)
    formDataPayload.append("requesterName", formData.requesterName)
    formDataPayload.append("relationshipToLearner", formData.relationshipToLearner)
    formDataPayload.append("emailAddress", formData.emailAddress)
    formDataPayload.append("mobileNumber", formData.mobileNumber)

    // Add files
    formDataPayload.append("validId", formData.validId)
    if (formData.authorizationLetter) {
      formDataPayload.append("authorizationLetter", formData.authorizationLetter)
    }

    const response = await fetch(`${this.baseUrl}/api/form137/submit`, {
      method: "POST",
      body: formDataPayload,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(`API Error: ${errorData.message}`)
    }

    return response.json()
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

    return response.json()
  }
}

export const formApiService = new FormApiService()
