export type RequestStatusType =
  | "submitted"
  | "under-review"
  | "processing"
  | "requires-clarification"
  | "completed"
  | "ready-for-pickup"
  | "cancelled"

export interface RegistrarComment {
  id: string
  message: string
  registrarName: string
  timestamp: string
  type: "info" | "clarification-needed" | "completion" | "update"
  requiresResponse: boolean
}

export interface Comment {
  id: string
  message: string
  author: string
  timestamp: string
  type: "info" | "clarification-needed" | "completion" | "update" | "user-response"
}

export interface TimelineEvent {
  description: string
  date: string
  status: RequestStatusType
}

export interface FormData {
  learnerReferenceNumber: string
  learnerFirstName: string
  learnerMiddleName?: string
  learnerLastName: string
  lastGradeLevel: string
  lastSchoolYear: string
  previousSchool: string
  requesterName: string
  relationshipToLearner: string
  mobileNumber: string
  purpose: string
}

export interface Request {
  id: string
  ticketNumber: string
  learnerName: string
  learnerReferenceNumber: string
  status: RequestStatusType
  submittedDate: string
  estimatedCompletion?: string
  requestType: string
  deliveryMethod: "pickup" | "mail"
  requesterName: string
  requesterEmail: string
  comments?: RegistrarComment[]
}

export interface RequestDetail {
  id: string
  ticketNumber: string
  learnerName: string
  status: RequestStatusType
  submittedDate: string
  estimatedCompletion?: string
  deliveryMethod: "pickup" | "mail"
  purpose: string
  requesterEmail: string
  formData: FormData
  comments: Comment[]
  timeline: TimelineEvent[]
}

export interface DashboardStatistics {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  averageProcessingTime: number
}

export interface DashboardData {
  requests: Request[]
  statistics: DashboardStatistics
}
