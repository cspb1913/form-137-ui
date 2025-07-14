"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "./file-upload"
import { type FormData, type FormErrors, validateForm } from "@/lib/validation"
import { formApiService, type FormSubmissionRequest } from "@/services/form-api"
import { useBotID } from "./botid-provider"
import { trackFormSubmission } from "@/lib/botid"

interface RequestForm137Props {
  onSuccess: (ticketNumber: string) => void
}

export function RequestForm137({ onSuccess }: RequestForm137Props) {
  const { toast } = useToast()
  const { isBot, botType, confidence, trackActivity } = useBotID()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [suspiciousActivityCount, setSuspiciousActivityCount] = useState(0)

  const [formData, setFormData] = useState<FormData>({
    learnerReferenceNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    lastGradeLevel: "",
    lastSchoolYear: "",
    previousSchool: "",
    purposeOfRequest: "",
    deliveryMethod: "",
    requesterName: "",
    relationshipToLearner: "",
    emailAddress: "",
    mobileNumber: "+63",
    validId: null,
    authorizationLetter: null,
  })

  const gradeOptions = [
    "Nursery",
    "Pre-Kindergarten",
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ]
  const relationshipOptions = ["Self", "Parent/Guardian", "Authorized Representative"]
  const deliveryOptions = ["Pick-up", "Courier"]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Track rapid form filling (potential bot behavior)
    if (value.length > 10 && Date.now() % 1000 < 100) {
      setSuspiciousActivityCount((prev) => prev + 1)
      if (suspiciousActivityCount > 3) {
        trackActivity("rapid_form_filling", {
          field,
          valueLength: value.length,
          suspiciousCount: suspiciousActivityCount,
        })
      }
    }
  }

  const handleMobileNumberChange = (value: string) => {
    // Ensure +63 prefix is always present
    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^\+?63?/, "")
    }
    handleInputChange("mobileNumber", value)
  }

  const handleFileSelect = (field: "validId" | "authorizationLetter", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Track file upload activity
    if (file) {
      trackActivity("file_upload", {
        field,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Additional bot protection checks
    if (isBot && confidence > 0.8) {
      toast({
        title: "Submission Blocked",
        description: "Automated submissions are not allowed.",
        variant: "destructive",
      })
      await trackActivity("blocked_bot_submission", {
        botType,
        confidence,
        formData: Object.keys(formData).reduce(
          (acc, key) => {
            acc[key] = !!formData[key as keyof FormData]
            return acc
          },
          {} as Record<string, boolean>,
        ),
      })
      return
    }

    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Track form submission attempt
      await trackFormSubmission(formData, { isBot, botType, confidence })

      // Prepare API request data
      const apiRequest: FormSubmissionRequest = {
        learnerReferenceNumber: formData.learnerReferenceNumber,
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        lastGradeLevel: formData.lastGradeLevel,
        lastSchoolYear: formData.lastSchoolYear,
        previousSchool: formData.previousSchool,
        purposeOfRequest: formData.purposeOfRequest,
        deliveryMethod: formData.deliveryMethod,
        requesterName: formData.requesterName,
        relationshipToLearner: formData.relationshipToLearner,
        emailAddress: formData.emailAddress,
        mobileNumber: formData.mobileNumber,
        validId: formData.validId!,
        authorizationLetter: formData.authorizationLetter || undefined,
      }

      // Submit to API
      const response = await formApiService.submitForm(apiRequest)

      // Track successful submission
      await trackActivity("successful_submission", {
        ticketNumber: response.ticketNumber,
        submittedAt: response.submittedAt,
      })

      toast({
        title: "Request Submitted",
        description: response.message,
      })

      onSuccess(response.ticketNumber)
    } catch (error) {
      console.error("Form submission error:", error)

      // Track submission error
      await trackActivity("submission_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        formData: Object.keys(formData).reduce(
          (acc, key) => {
            acc[key] = !!formData[key as keyof FormData]
            return acc
          },
          {} as Record<string, boolean>,
        ),
      })

      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-2xl font-bold text-center">
              Request Form 137 (Learner's Permanent Record)
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Learner Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Learner Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="learnerReferenceNumber">
                      Learner Reference Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="learnerReferenceNumber"
                      type="text"
                      placeholder="e.g., 123456789012"
                      maxLength={12}
                      value={formData.learnerReferenceNumber}
                      onChange={(e) => handleInputChange("learnerReferenceNumber", e.target.value.replace(/\D/g, ""))}
                      className={errors.learnerReferenceNumber ? "border-red-500" : ""}
                      aria-describedby={errors.learnerReferenceNumber ? "lrn-error" : undefined}
                    />
                    {errors.learnerReferenceNumber && (
                      <p id="lrn-error" className="text-sm text-red-600 mt-1" role="alert">
                        {errors.learnerReferenceNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange("middleName", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className={errors.dateOfBirth ? "border-red-500" : ""}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Academic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastGradeLevel">
                      Last Grade Level Completed <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.lastGradeLevel}
                      onValueChange={(value) => handleInputChange("lastGradeLevel", value)}
                    >
                      <SelectTrigger className={errors.lastGradeLevel ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.lastGradeLevel && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.lastGradeLevel}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastSchoolYear">
                      Last School Year Attended <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastSchoolYear"
                      type="text"
                      placeholder="e.g., 2023"
                      maxLength={4}
                      value={formData.lastSchoolYear}
                      onChange={(e) => handleInputChange("lastSchoolYear", e.target.value.replace(/\D/g, ""))}
                      className={errors.lastSchoolYear ? "border-red-500" : ""}
                    />
                    {errors.lastSchoolYear && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.lastSchoolYear}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="previousSchool">
                      Previous School/Campus <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="previousSchool"
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => handleInputChange("previousSchool", e.target.value)}
                      className={errors.previousSchool ? "border-red-500" : ""}
                    />
                    {errors.previousSchool && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.previousSchool}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Request Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Request Details</h3>

                <div>
                  <Label htmlFor="purposeOfRequest">
                    Purpose of Request <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="purposeOfRequest"
                    rows={3}
                    value={formData.purposeOfRequest}
                    onChange={(e) => handleInputChange("purposeOfRequest", e.target.value)}
                    className={errors.purposeOfRequest ? "border-red-500" : ""}
                  />
                  {errors.purposeOfRequest && (
                    <p className="text-sm text-red-600 mt-1" role="alert">
                      {errors.purposeOfRequest}
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Delivery Method <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.deliveryMethod}
                    onValueChange={(value) => handleInputChange("deliveryMethod", value)}
                    className="mt-2"
                  >
                    {deliveryOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.deliveryMethod && (
                    <p className="text-sm text-red-600 mt-1" role="alert">
                      {errors.deliveryMethod}
                    </p>
                  )}
                </div>
              </div>

              {/* Requester Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Requester Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requesterName">
                      Requester Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="requesterName"
                      type="text"
                      value={formData.requesterName}
                      onChange={(e) => handleInputChange("requesterName", e.target.value)}
                      className={errors.requesterName ? "border-red-500" : ""}
                    />
                    {errors.requesterName && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.requesterName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="relationshipToLearner">
                      Relationship to Learner <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.relationshipToLearner}
                      onValueChange={(value) => handleInputChange("relationshipToLearner", value)}
                    >
                      <SelectTrigger className={errors.relationshipToLearner ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.relationshipToLearner && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.relationshipToLearner}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emailAddress">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                      className={errors.emailAddress ? "border-red-500" : ""}
                    />
                    {errors.emailAddress && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.emailAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="mobileNumber">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => handleMobileNumberChange(e.target.value)}
                      className={errors.mobileNumber ? "border-red-500" : ""}
                      placeholder="+639123456789"
                    />
                    {errors.mobileNumber && (
                      <p className="text-sm text-red-600 mt-1" role="alert">
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Required Documents
                </h3>

                <FileUpload
                  label="Upload Valid ID"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5 * 1024 * 1024}
                  onFileSelect={(file) => handleFileSelect("validId", file)}
                  error={errors.validId}
                  file={formData.validId}
                />

                {formData.relationshipToLearner !== "Self" && (
                  <FileUpload
                    label="Upload Authorization Letter"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5 * 1024 * 1024}
                    onFileSelect={(file) => handleFileSelect("authorizationLetter", file)}
                    error={errors.authorizationLetter}
                    file={formData.authorizationLetter}
                  />
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || (isBot && confidence > 0.8)}
                  className="w-full md:w-auto md:ml-auto md:block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8"
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
