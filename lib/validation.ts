export interface FormData {
  learnerReferenceNumber: string
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  lastGradeLevel: string
  lastSchoolYear: string
  previousSchool: string
  purposeOfRequest: string
  deliveryMethod: string
  requesterName: string
  relationshipToLearner: string
  emailAddress: string
  mobileNumber: string
  validId: File | null
  authorizationLetter: File | null
}

export interface FormErrors {
  [key: string]: string
}

export const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {}

  // Learner Reference Number - 12 digits
  if (!data.learnerReferenceNumber) {
    errors.learnerReferenceNumber = "Learner Reference Number is required"
  } else if (!/^\d{12}$/.test(data.learnerReferenceNumber)) {
    errors.learnerReferenceNumber = "Must be exactly 12 digits"
  }

  // Required text fields
  if (!data.firstName.trim()) errors.firstName = "First Name is required"
  if (!data.lastName.trim()) errors.lastName = "Last Name is required"
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of Birth is required"
  if (!data.lastGradeLevel) errors.lastGradeLevel = "Last Grade Level is required"
  if (!data.lastSchoolYear) errors.lastSchoolYear = "Last School Year is required"
  if (!data.previousSchool.trim()) errors.previousSchool = "Previous School is required"
  if (!data.purposeOfRequest.trim()) errors.purposeOfRequest = "Purpose of Request is required"
  if (!data.deliveryMethod) errors.deliveryMethod = "Delivery Method is required"
  if (!data.requesterName.trim()) errors.requesterName = "Requester Name is required"
  if (!data.relationshipToLearner) errors.relationshipToLearner = "Relationship to Learner is required"

  // Email validation
  if (!data.emailAddress) {
    errors.emailAddress = "Email Address is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailAddress)) {
    errors.emailAddress = "Please enter a valid email address"
  }

  // Philippine mobile number validation
  if (!data.mobileNumber) {
    errors.mobileNumber = "Mobile Number is required"
  } else if (!/^\+63\d{10}$/.test(data.mobileNumber)) {
    errors.mobileNumber = "Please enter a valid Philippine mobile number"
  }

  // File validations
  if (!data.validId) {
    errors.validId = "Valid ID is required"
  } else {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"]
    if (!validTypes.includes(data.validId.type)) {
      errors.validId = "Please upload a PDF, JPG, or PNG file"
    } else if (data.validId.size > 5 * 1024 * 1024) {
      errors.validId = "File size must be less than 5MB"
    }
  }

  // Authorization letter validation (only if not self)
  if (data.relationshipToLearner !== "Self" && !data.authorizationLetter) {
    errors.authorizationLetter = "Authorization Letter is required"
  } else if (data.authorizationLetter) {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"]
    if (!validTypes.includes(data.authorizationLetter.type)) {
      errors.authorizationLetter = "Please upload a PDF, JPG, or PNG file"
    } else if (data.authorizationLetter.size > 5 * 1024 * 1024) {
      errors.authorizationLetter = "File size must be less than 5MB"
    }
  }

  return errors
}

export const generateSchoolYears = (): string[] => {
  const years = []
  for (let year = 2010; year <= 2025; year++) {
    years.push(`SY ${year}-${year + 1}`)
  }
  return years
}
