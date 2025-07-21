import { validateForm, generateSchoolYears, type FormData } from "@/lib/validation"

describe("Form Validation", () => {
  const validFormData: FormData = {
    learnerReferenceNumber: "123456789012",
    firstName: "John",
    middleName: "Middle",
    lastName: "Doe",
    dateOfBirth: "2000-01-01",
    lastGradeLevel: "Grade 12",
    lastSchoolYear: "SY 2020-2021",
    previousSchool: "Test School",
    purposeOfRequest: "College application",
    deliveryMethod: "Email",
    requesterName: "John Doe",
    relationshipToLearner: "Self",
    emailAddress: "john@example.com",
    mobileNumber: "+639123456789",
  }

  test("should pass validation with valid data", () => {
    const errors = validateForm(validFormData)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  test("should require learner reference number", () => {
    const data = { ...validFormData, learnerReferenceNumber: "" }
    const errors = validateForm(data)
    expect(errors.learnerReferenceNumber).toBe("Learner Reference Number is required")
  })

  test("should validate learner reference number format", () => {
    const data = { ...validFormData, learnerReferenceNumber: "12345" }
    const errors = validateForm(data)
    expect(errors.learnerReferenceNumber).toBe("Must be exactly 12 digits")
  })

  test("should require first name", () => {
    const data = { ...validFormData, firstName: "" }
    const errors = validateForm(data)
    expect(errors.firstName).toBe("First Name is required")
  })

  test("should require last name", () => {
    const data = { ...validFormData, lastName: "" }
    const errors = validateForm(data)
    expect(errors.lastName).toBe("Last Name is required")
  })

  test("should validate email format", () => {
    const data = { ...validFormData, emailAddress: "invalid-email" }
    const errors = validateForm(data)
    expect(errors.emailAddress).toBe("Please enter a valid email address")
  })

  test("should validate Philippine mobile number format", () => {
    const data = { ...validFormData, mobileNumber: "123456789" }
    const errors = validateForm(data)
    expect(errors.mobileNumber).toBe("Please enter a valid Philippine mobile number")
  })
})

describe("generateSchoolYears", () => {
  test("should generate correct school years", () => {
    const years = generateSchoolYears()
    expect(years).toContain("SY 2010-2011")
    expect(years).toContain("SY 2025-2026")
    expect(years).toHaveLength(16)
  })
})
