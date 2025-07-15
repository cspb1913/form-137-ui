export type RequestStatus = "submitted" | "processing" | "completed" | "rejected"
export type Priority = "low" | "normal" | "high"
export type PaymentStatus = "pending" | "paid" | "refunded"

export interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  url: string
}

export interface TimelineEvent {
  id: string
  status: RequestStatus
  timestamp: string
  description: string
  user: string
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  isInternal: boolean
}

export interface Form137Request {
  id: string
  studentName: string
  studentId: string
  requestType: string
  status: RequestStatus
  priority: Priority
  submittedDate: string
  completedDate?: string
  estimatedCompletion?: string
  registrarNotes?: string
  purpose: string
  contactEmail: string
  contactPhone: string
  deliveryMethod: string
  paymentStatus: PaymentStatus
  documents: Document[]
  timeline: TimelineEvent[]
  comments: Comment[]
}

export interface DashboardStats {
  total: number
  submitted: number
  processing: number
  completed: number
  rejected: number
}
