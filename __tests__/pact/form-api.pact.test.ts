import { Pact } from "@pact-foundation/pact"
import { FormApiService, type FormSubmissionRequest } from "@/services/form-api"
import path from "path"

const mockProvider = new Pact({
  consumer: "Form137Frontend",
  provider: "Form137API",
  port: 1234,
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  dir: path.resolve(process.cwd(), "pacts"),
  logLevel: "INFO",
})

describe("Form137 API Pact Tests", () => {
  let apiService: FormApiService

  beforeAll(async () => {
    await mockProvider.setup()
    apiService = new FormApiService("http://localhost:1234")
  })

  afterAll(async () => {
    await mockProvider.finalize()
  })

  afterEach(async () => {
    await mockProvider.verify()
  })

  describe("Form Submission", () => {
    test("should successfully submit a complete form with all required fields", async () => {
      // Create mock files
      const validIdFile = new File(["mock-id-content"], "valid-id.pdf", { type: "application/pdf" })
      const authLetterFile = new File(["mock-auth-content"], "auth-letter.pdf", { type: "application/pdf" })

      const formData: FormSubmissionRequest = {
        learnerReferenceNumber: "123456789012",
        firstName: "Juan",
        middleName: "Santos",
        lastName: "Dela Cruz",
        dateOfBirth: "2000-01-15",
        lastGradeLevel: "Grade 12",
        lastSchoolYear: "2023",
        previousSchool: "Manila High School",
        purposeOfRequest: "College application requirements",
        deliveryMethod: "Pick-up",
        requesterName: "Maria Dela Cruz",
        relationshipToLearner: "Parent/Guardian",
        emailAddress: "maria.delacruz@email.com",
        mobileNumber: "+639123456789",
        validId: validIdFile,
        authorizationLetter: authLetterFile,
      }

      await mockProvider.addInteraction({
        state: "API is available for form submission",
        uponReceiving: "a valid form submission with all required fields",
        withRequest: {
          method: "POST",
          path: "/api/form137/submit",
          headers: {
            "Content-Type": "multipart/form-data; boundary=----formdata-pact-boundary",
          },
          body: {
            learnerReferenceNumber: "123456789012",
            firstName: "Juan",
            middleName: "Santos",
            lastName: "Dela Cruz",
            dateOfBirth: "2000-01-15",
            lastGradeLevel: "Grade 12",
            lastSchoolYear: "2023",
            previousSchool: "Manila High School",
            purposeOfRequest: "College application requirements",
            deliveryMethod: "Pick-up",
            requesterName: "Maria Dela Cruz",
            relationshipToLearner: "Parent/Guardian",
            emailAddress: "maria.delacruz@email.com",
            mobileNumber: "+639123456789",
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            ticketNumber: "REQ-2025-00123",
            status: "submitted",
            submittedAt: "2025-01-11T21:52:11.000Z",
            updatedAt: "2025-01-11T21:52:11.000Z",
            notes: "Request for urgent processing.",
          },
        },
      })

      const response = await apiService.submitForm(formData)

      expect(response.success).toBe(true)
      expect(response.ticketNumber).toBe("REQ-2025-00123")
      expect(response.message).toBe("Request for urgent processing.")
      expect(response.submittedAt).toBe("2025-01-11T21:52:11.000Z")
    })

    test("should successfully submit form for self-requester without authorization letter", async () => {
      const validIdFile = new File(["mock-id-content"], "valid-id.pdf", { type: "application/pdf" })

      const formData: FormSubmissionRequest = {
        learnerReferenceNumber: "987654321098",
        firstName: "Anna",
        lastName: "Garcia",
        dateOfBirth: "1995-05-20",
        lastGradeLevel: "Grade 11",
        lastSchoolYear: "2022",
        previousSchool: "Quezon City High School",
        purposeOfRequest: "Job application",
        deliveryMethod: "Courier",
        requesterName: "Anna Garcia",
        relationshipToLearner: "Self",
        emailAddress: "anna.garcia@email.com",
        mobileNumber: "+639987654321",
        validId: validIdFile,
      }

      await mockProvider.addInteraction({
        state: "API is available for self-requester form submission",
        uponReceiving: "a valid form submission from self-requester",
        withRequest: {
          method: "POST",
          path: "/api/form137/submit",
          headers: {
            "Content-Type": "multipart/form-data; boundary=----formdata-pact-boundary",
          },
          body: {
            learnerReferenceNumber: "987654321098",
            firstName: "Anna",
            lastName: "Garcia",
            dateOfBirth: "1995-05-20",
            lastGradeLevel: "Grade 11",
            lastSchoolYear: "2022",
            previousSchool: "Quezon City High School",
            purposeOfRequest: "Job application",
            deliveryMethod: "Courier",
            requesterName: "Anna Garcia",
            relationshipToLearner: "Self",
            emailAddress: "anna.garcia@email.com",
            mobileNumber: "+639987654321",
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            ticketNumber: "REQ-2025-00124",
            status: "submitted",
            submittedAt: "2025-01-11T21:52:11.000Z",
            updatedAt: "2025-01-11T21:52:11.000Z",
            notes: "Request for urgent processing.",
          },
        },
      })

      const response = await apiService.submitForm(formData)

      expect(response.success).toBe(true)
      expect(response.ticketNumber).toBe("REQ-2025-00124")
      expect(response.message).toBe("Request for urgent processing.")
    })

    test("should handle validation errors from API", async () => {
      const validIdFile = new File(["mock-id-content"], "valid-id.pdf", { type: "application/pdf" })

      const invalidFormData: FormSubmissionRequest = {
        learnerReferenceNumber: "12345", // Invalid - too short
        firstName: "",
        lastName: "Test",
        dateOfBirth: "2000-01-01",
        lastGradeLevel: "Grade 12",
        lastSchoolYear: "2023",
        previousSchool: "Test School",
        purposeOfRequest: "Test purpose",
        deliveryMethod: "Pick-up",
        requesterName: "Test Requester",
        relationshipToLearner: "Self",
        emailAddress: "invalid-email",
        mobileNumber: "+639123456789",
        validId: validIdFile,
      }

      await mockProvider.addInteraction({
        state: "API validates form data",
        uponReceiving: "an invalid form submission with validation errors",
        withRequest: {
          method: "POST",
          path: "/api/form137/submit",
          headers: {
            "Content-Type": "multipart/form-data; boundary=----formdata-pact-boundary",
          },
          body: {
            learnerReferenceNumber: "12345",
            firstName: "",
            lastName: "Test",
            dateOfBirth: "2000-01-01",
            lastGradeLevel: "Grade 12",
            lastSchoolYear: "2023",
            previousSchool: "Test School",
            purposeOfRequest: "Test purpose",
            deliveryMethod: "Pick-up",
            requesterName: "Test Requester",
            relationshipToLearner: "Self",
            emailAddress: "invalid-email",
            mobileNumber: "+639123456789",
          },
        },
        willRespondWith: {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: "Validation Error",
            message: "Form validation failed",
            statusCode: 400,
            details: {
              learnerReferenceNumber: ["Must be exactly 12 digits"],
              firstName: ["First name is required"],
              emailAddress: ["Please enter a valid email address"],
            },
          },
        },
      })

      await expect(apiService.submitForm(invalidFormData)).rejects.toThrow("API Error: Form validation failed")
    })
  })

  describe("Status Check", () => {
    test("should retrieve submission status by ticket number", async () => {
      const ticketNumber = "REQ-2025-00123"

      await mockProvider.addInteraction({
        state: "A form submission exists with ticket number REQ-2025-00123",
        uponReceiving: "a request for submission status",
        withRequest: {
          method: "GET",
          path: `/api/form137/status/${ticketNumber}`,
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            ticketNumber: "REQ-2025-00123",
            status: "processing",
            submittedAt: "2025-01-11T21:52:11.000Z",
            updatedAt: "2025-01-12T09:30:00.000Z",
            notes: "Documents under review",
          },
        },
      })

      const response = await apiService.getSubmissionStatus(ticketNumber)

      expect(response.ticketNumber).toBe("REQ-2025-00123")
      expect(response.status).toBe("processing")
      expect(response.submittedAt).toBe("2025-01-11T21:52:11.000Z")
      expect(response.updatedAt).toBe("2025-01-12T09:30:00.000Z")
      expect(response.notes).toBe("Documents under review")
    })

    test("should handle non-existent ticket number", async () => {
      const ticketNumber = "REQ-2025-99999"

      await mockProvider.addInteraction({
        state: "No form submission exists with ticket number REQ-2025-99999",
        uponReceiving: "a request for non-existent submission status",
        withRequest: {
          method: "GET",
          path: `/api/form137/status/${ticketNumber}`,
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            error: "Not Found",
            message: "Submission not found",
            statusCode: 404,
          },
        },
      })

      await expect(apiService.getSubmissionStatus(ticketNumber)).rejects.toThrow("API Error: Submission not found")
    })
  })
})
