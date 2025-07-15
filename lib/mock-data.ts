import type { Form137Request, RequestStatus, Priority } from "@/types/dashboard"

export const mockRequests: Form137Request[] = [
  {
    id: "REQ-2024-001",
    studentName: "Maria Santos",
    studentId: "2020-12345",
    requestType: "Original Copy",
    status: "completed" as RequestStatus,
    priority: "normal" as Priority,
    submittedDate: "2024-01-15",
    completedDate: "2024-01-20",
    estimatedCompletion: "2024-01-22",
    registrarNotes: "Document ready for pickup",
    purpose: "Job Application",
    contactEmail: "maria.santos@email.com",
    contactPhone: "+63 912 345 6789",
    deliveryMethod: "Pickup",
    paymentStatus: "paid",
    documents: [
      {
        id: "doc-001",
        name: "Form 137 - Maria Santos.pdf",
        type: "application/pdf",
        size: 2048576,
        uploadedAt: "2024-01-20T10:30:00Z",
        url: "/documents/form-137-maria-santos.pdf",
      },
    ],
    timeline: [
      {
        id: "timeline-001",
        status: "submitted",
        timestamp: "2024-01-15T09:00:00Z",
        description: "Request submitted successfully",
        user: "Maria Santos",
      },
      {
        id: "timeline-002",
        status: "processing",
        timestamp: "2024-01-16T14:30:00Z",
        description: "Request under review by registrar",
        user: "Registrar Office",
      },
      {
        id: "timeline-003",
        status: "completed",
        timestamp: "2024-01-20T10:30:00Z",
        description: "Document processed and ready for pickup",
        user: "Registrar Office",
      },
    ],
    comments: [
      {
        id: "comment-001",
        author: "Registrar Office",
        content: "Your Form 137 has been processed and is ready for pickup. Please bring a valid ID.",
        timestamp: "2024-01-20T10:30:00Z",
        isInternal: false,
      },
    ],
  },
  {
    id: "REQ-2024-002",
    studentName: "Juan Dela Cruz",
    studentId: "2019-67890",
    requestType: "Certified Copy",
    status: "processing" as RequestStatus,
    priority: "high" as Priority,
    submittedDate: "2024-01-18",
    estimatedCompletion: "2024-01-25",
    registrarNotes: "Urgent request - expedited processing",
    purpose: "University Transfer",
    contactEmail: "juan.delacruz@email.com",
    contactPhone: "+63 917 123 4567",
    deliveryMethod: "Mail",
    paymentStatus: "paid",
    documents: [],
    timeline: [
      {
        id: "timeline-004",
        status: "submitted",
        timestamp: "2024-01-18T11:15:00Z",
        description: "Urgent request submitted",
        user: "Juan Dela Cruz",
      },
      {
        id: "timeline-005",
        status: "processing",
        timestamp: "2024-01-19T08:00:00Z",
        description: "Priority processing initiated",
        user: "Registrar Office",
      },
    ],
    comments: [
      {
        id: "comment-002",
        author: "Juan Dela Cruz",
        content: "This is urgent for my university transfer application. Please expedite if possible.",
        timestamp: "2024-01-18T11:20:00Z",
        isInternal: false,
      },
      {
        id: "comment-003",
        author: "Registrar Office",
        content: "We've marked this as priority. Expected completion by January 25th.",
        timestamp: "2024-01-19T08:30:00Z",
        isInternal: false,
      },
    ],
  },
  {
    id: "REQ-2024-003",
    studentName: "Ana Rodriguez",
    studentId: "2021-11111",
    requestType: "Original Copy",
    status: "submitted" as RequestStatus,
    priority: "normal" as Priority,
    submittedDate: "2024-01-22",
    estimatedCompletion: "2024-01-29",
    purpose: "Employment",
    contactEmail: "ana.rodriguez@email.com",
    contactPhone: "+63 905 987 6543",
    deliveryMethod: "Pickup",
    paymentStatus: "pending",
    documents: [],
    timeline: [
      {
        id: "timeline-006",
        status: "submitted",
        timestamp: "2024-01-22T14:45:00Z",
        description: "Request submitted and awaiting payment",
        user: "Ana Rodriguez",
      },
    ],
    comments: [],
  },
  {
    id: "REQ-2024-004",
    studentName: "Carlos Mendoza",
    studentId: "2018-22222",
    requestType: "Certified Copy",
    status: "rejected" as RequestStatus,
    priority: "normal" as Priority,
    submittedDate: "2024-01-20",
    purpose: "Personal Records",
    contactEmail: "carlos.mendoza@email.com",
    contactPhone: "+63 918 555 1234",
    deliveryMethod: "Mail",
    paymentStatus: "refunded",
    registrarNotes: "Incomplete requirements - missing authorization letter",
    documents: [],
    timeline: [
      {
        id: "timeline-007",
        status: "submitted",
        timestamp: "2024-01-20T16:20:00Z",
        description: "Request submitted",
        user: "Carlos Mendoza",
      },
      {
        id: "timeline-008",
        status: "rejected",
        timestamp: "2024-01-21T10:00:00Z",
        description: "Request rejected due to incomplete requirements",
        user: "Registrar Office",
      },
    ],
    comments: [
      {
        id: "comment-004",
        author: "Registrar Office",
        content:
          "Your request has been rejected due to missing authorization letter. Please resubmit with complete requirements.",
        timestamp: "2024-01-21T10:00:00Z",
        isInternal: false,
      },
    ],
  },
]

export const mockStats = {
  total: 4,
  submitted: 1,
  processing: 1,
  completed: 1,
  rejected: 1,
}

export const mockRequestDetail = mockRequests[0]

export function getMockRequestById(id: string): Form137Request | undefined {
  return mockRequests.find((request) => request.id === id)
}

export function getMockRequests(): Form137Request[] {
  return mockRequests
}

export function getMockStats() {
  return mockStats
}
