import { NextResponse } from "next/server"

// Mock data for development - in production this would connect to a real database
let mockRequests = [
  {
    ticketNumber: "REQ-2025-00001",
    learnerReferenceNumber: "123456789012",
    requesterName: "John Doe",
    status: "submitted",
    submittedAt: "2025-01-15T10:30:00Z",
    comments: "Initial submission"
  },
  {
    ticketNumber: "REQ-2025-00002", 
    learnerReferenceNumber: "234567890123",
    requesterName: "Jane Smith",
    status: "processing",
    submittedAt: "2025-01-14T14:20:00Z",
    comments: "Processing started"
  },
  {
    ticketNumber: "REQ-2025-00003",
    learnerReferenceNumber: "345678901234", 
    requesterName: "Bob Johnson",
    status: "completed",
    submittedAt: "2025-01-13T09:15:00Z",
    comments: "Request completed successfully"
  },
  {
    ticketNumber: "REQ-2025-00004",
    learnerReferenceNumber: "456789012345",
    requesterName: "Alice Brown", 
    status: "rejected",
    submittedAt: "2025-01-12T16:45:00Z",
    comments: "Missing required documents"
  }
]

export async function GET(
  request: Request,
  { params }: { params: { ticketNumber: string } }
) {
  try {
    const { ticketNumber } = await params
    const requestDetail = mockRequests.find(req => req.ticketNumber === ticketNumber)
    
    if (!requestDetail) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { request: requestDetail },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching request detail:", error)
    return NextResponse.json(
      { error: "Failed to fetch request detail" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { ticketNumber: string } }
) {
  try {
    const { ticketNumber } = await params
    const body = await request.json()
    const { status, comments } = body

    const requestIndex = mockRequests.findIndex(req => req.ticketNumber === ticketNumber)
    
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    // Update the request
    if (status !== undefined) {
      mockRequests[requestIndex].status = status
    }
    if (comments !== undefined) {
      mockRequests[requestIndex].comments = comments
    }

    return NextResponse.json(
      { 
        message: "Request updated successfully",
        request: mockRequests[requestIndex]
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    )
  }
}