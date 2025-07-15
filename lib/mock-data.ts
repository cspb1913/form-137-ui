import type { DashboardRequest, RequestDetail, DashboardStats } from "@/types/dashboard"

export const mockDashboardStats: DashboardStats = {
  totalRequests: 24,
  pendingRequests: 8,
  approvedRequests: 12,
  rejectedRequests: 4,
}

export const mockDashboardRequests: DashboardRequest[] = [
  {
    id: "REQ-2024-001",
    studentName: "Maria Santos",
    requestType: "Form 137",
    status: "pending",
    submittedDate: "2024-01-15",
    lastUpdated: "2024-01-16",
    priority: "normal",
  },
  {
    id: "REQ-2024-002",
    studentName: "Juan Dela Cruz",
    requestType: "Form 137",
    status: "approved",
    submittedDate: "2024-01-14",
    lastUpdated: "2024-01-17",
    priority: "high",
  },
  {
    id: "REQ-2024-003",
    studentName: "Ana Rodriguez",
    requestType: "Form 137",
    status: "processing",
    submittedDate: "2024-01-13",
    lastUpdated: "2024-01-18",
    priority: "normal",
  },
  {
    id: "REQ-2024-004",
    studentName: "Carlos Mendoza",
    requestType: "Form 137",
    status: "rejected",
    submittedDate: "2024-01-12",
    lastUpdated: "2024-01-19",
    priority: "low",
  },
  {
    id: "REQ-2024-005",
    studentName: "Sofia Reyes",
    requestType: "Form 137",
    status: "completed",
    submittedDate: "2024-01-11",
    lastUpdated: "2024-01-20",
    priority: "normal",
  },
]

export const mockRequestDetail: RequestDetail = {
  id: "REQ-2024-001",
  studentName: "Maria Santos",
  requestType: "Form 137",
  status: "pending",
  submittedDate: "2024-01-15",
  lastUpdated: "2024-01-16",
  priority: "normal",
  studentInfo: {
    fullName: "Maria Elena Santos",
    studentId: "2019-123456",
    yearLevel: "Grade 12",
    section: "STEM-A",
    schoolYear: "2023-2024",
    contactNumber: "+63 912 345 6789",
    email: "maria.santos@email.com",
    address: "123 Main Street, Quezon City, Metro Manila",
  },
  requestDetails: {
    purpose: "College Application",
    urgency: "Regular",
    copies: 2,
    deliveryMethod: "Pickup",
    specialInstructions: "Please include all academic records from Grade 7 to Grade 12.",
  },
  timeline: [
    {
      date: "2024-01-15",
      status: "submitted",
      description: "Request submitted by student",
      actor: "Maria Santos",
    },
    {
      date: "2024-01-16",
      status: "received",
      description: "Request received and assigned to registrar",
      actor: "System",
    },
    {
      date: "2024-01-16",
      status: "processing",
      description: "Document preparation in progress",
      actor: "Registrar Office",
    },
  ],
  comments: [
    {
      id: "1",
      author: "Registrar Office",
      message:
        "We have received your request and are currently processing it. Expected completion is within 3-5 business days.",
      timestamp: "2024-01-16T10:30:00Z",
      isInternal: false,
    },
    {
      id: "2",
      author: "Maria Santos",
      message: "Thank you for the update. I need this for my college application deadline on January 25th.",
      timestamp: "2024-01-16T14:15:00Z",
      isInternal: false,
    },
  ],
  attachments: [
    {
      id: "1",
      name: "student-id-copy.pdf",
      size: "245 KB",
      uploadedDate: "2024-01-15",
    },
    {
      id: "2",
      name: "birth-certificate.pdf",
      size: "189 KB",
      uploadedDate: "2024-01-15",
    },
  ],
  registrarInfo: {
    assignedTo: "Ms. Carmen Dela Rosa",
    office: "Registrar Office",
    contactNumber: "+63 2 8123 4567",
    email: "registrar@school.edu.ph",
    officeHours: "Monday-Friday, 8:00 AM - 5:00 PM",
  },
}
