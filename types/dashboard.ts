export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
}

export interface DashboardRequest {
  id: string
  studentName: string
  requestType: string
  status: "pending" | "processing" | "approved" | "completed" | "rejected"
  submittedDate: string
  lastUpdated: string
  priority: "low" | "normal" | "high"
}

export interface StudentInfo {
  fullName: string
  studentId: string
  yearLevel: string
  section: string
  schoolYear: string
  contactNumber: string
  email: string
  address: string
}

export interface RequestDetails {
  purpose: string
  urgency: string
  copies: number
  deliveryMethod: string
  specialInstructions?: string
}

export interface TimelineEvent {
  date: string
  status: string
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
  uploadedDate: string
}

export interface RegistrarInfo {
  assignedTo: string
  office: string
  contactNumber: string
  email: string
  officeHours: string
}

export interface RequestDetail {
  id: string
  studentName: string
  requestType: string
  status: "pending" | "processing" | "approved" | "completed" | "rejected"
  submittedDate: string
  lastUpdated: string
  priority: "low" | "normal" | "high"
  studentInfo: StudentInfo
  requestDetails: RequestDetails
  timeline: TimelineEvent[]
  comments: Comment[]
  attachments?: Attachment[]
  registrarInfo: RegistrarInfo
}
