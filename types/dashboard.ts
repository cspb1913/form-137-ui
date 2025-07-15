export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  rejectedRequests: number
}

export interface DashboardRequest {
  id: string
  studentName: string
  requestType: string
  status: "pending" | "in_progress" | "completed" | "rejected" | "under_review" | "cancelled"
  submittedDate: string
  lastUpdated: string
  priority: "low" | "normal" | "high"
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
}

export interface RequestDetails {
  purpose: string
  copies: number
  deliveryMethod: "pickup" | "mail" | "email"
  urgentRequest: boolean
  notes?: string
}

export interface TimelineEvent {
  id: string
  status: string
  timestamp: string
  description: string
  actor: string
}

export interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
  isInternal: boolean
}

export interface Attachment {
  id: string
  name: string
  size: string
  uploadedAt: string
}

export interface RequestDetail {
  id: string
  studentName: string
  studentId: string
  requestType: string
  status: "pending" | "in_progress" | "completed" | "rejected" | "under_review" | "cancelled"
  submittedDate: string
  lastUpdated: string
  priority: "low" | "normal" | "high"
  contactInfo: ContactInfo
  requestDetails: RequestDetails
  timeline: TimelineEvent[]
  comments: Comment[]
  attachments: Attachment[]
}
