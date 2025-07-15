import type { DashboardRequest, RequestDetail, DashboardStats } from "@/types/dashboard"

export const mockDashboardStats: DashboardStats = {
  totalRequests: 24,
  pendingRequests: 8,
  completedRequests: 14,
  rejectedRequests: 2,
}

export const mockDashboardRequests: DashboardRequest[] = [
  {
    id: "REQ-2024-001",
    studentName: "Maria Santos",
    requestType: "Original Copy",
    status: "pending",
    submittedDate: "2024-01-15",
    lastUpdated: "2024-01-16",
    priority: "normal",
  },
  {
    id: "REQ-2024-002",
    studentName: "Juan Dela Cruz",
    requestType: "Certified Copy",
    status: "in_progress",
    submittedDate: "2024-01-14",
    lastUpdated: "2024-01-17",
    priority: "high",
  },
  {
    id: "REQ-2024-003",
    studentName: "Ana Rodriguez",
    requestType: "Digital Copy",
    status: "completed",
    submittedDate: "2024-01-10",
    lastUpdated: "2024-01-15",
    priority: "normal",
  },
  {
    id: "REQ-2024-004",
    studentName: "Carlos Mendoza",
    requestType: "Original Copy",
    status: "rejected",
    submittedDate: "2024-01-12",
    lastUpdated: "2024-01-14",
    priority: "low",
  },
  {
    id: "REQ-2024-005",
    studentName: "Sofia Reyes",
    requestType: "Certified Copy",
    status: "pending",
    submittedDate: "2024-01-18",
    lastUpdated: "2024-01-18",
    priority: "high",
  },
]

export const mockRequestDetail: RequestDetail = {
  id: "REQ-2024-001",
  studentName: "Maria Santos",
  studentId: "2020-12345",
  requestType: "Original Copy",
  status: "in_progress",
  submittedDate: "2024-01-15",
  lastUpdated: "2024-01-17",
  priority: "normal",
  contactInfo: {
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    address: "123 Main St, Quezon City, Metro Manila",
  },
  requestDetails: {
    purpose: "Employment Requirements",
    copies: 2,
    deliveryMethod: "pickup",
    urgentRequest: false,
    notes: "Needed for job application at ABC Company",
  },
  timeline: [
    {
      id: "1",
      status: "submitted",
      timestamp: "2024-01-15T09:00:00Z",
      description: "Request submitted successfully",
      actor: "Student",
    },
    {
      id: "2",
      status: "under_review",
      timestamp: "2024-01-15T14:30:00Z",
      description: "Request is being reviewed by registrar office",
      actor: "Registrar Staff",
    },
    {
      id: "3",
      status: "in_progress",
      timestamp: "2024-01-16T10:15:00Z",
      description: "Document preparation has started",
      actor: "Registrar Staff",
    },
  ],
  comments: [
    {
      id: "1",
      author: "Registrar Office",
      message: "Your request has been received and is being processed. Expected completion in 3-5 business days.",
      timestamp: "2024-01-15T14:30:00Z",
      isInternal: false,
    },
    {
      id: "2",
      author: "Maria Santos",
      message: "Thank you! Is it possible to expedite this request? I have a job interview next week.",
      timestamp: "2024-01-16T08:45:00Z",
      isInternal: false,
    },
    {
      id: "3",
      author: "Registrar Office",
      message: "We'll do our best to prioritize your request. Please ensure all required documents are complete.",
      timestamp: "2024-01-16T11:20:00Z",
      isInternal: false,
    },
  ],
  attachments: [
    {
      id: "1",
      name: "student_id_copy.pdf",
      size: "245 KB",
      uploadedAt: "2024-01-15T09:00:00Z",
    },
    {
      id: "2",
      name: "authorization_letter.pdf",
      size: "180 KB",
      uploadedAt: "2024-01-15T09:02:00Z",
    },
  ],
}
