"use client"

import { RequestForm137 } from "@/components/request-form-137"

interface RequestClientPageProps {
  onSubmit: (data: any) => void
}

const RequestClientPage = ({ onSubmit }: RequestClientPageProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Form 137</h1>
        <p className="text-gray-600">
          Please fill out the form below to request your Form 137. All fields marked with an asterisk (*) are required.
        </p>
      </div>

      <RequestForm137 onSubmit={onSubmit} />
    </div>
  )
}

export default RequestClientPage
