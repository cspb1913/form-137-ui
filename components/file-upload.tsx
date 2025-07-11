"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  label: string
  required?: boolean
  accept: string
  maxSize: number
  onFileSelect: (file: File | null) => void
  error?: string
  file?: File | null
}

export function FileUpload({ label, required = false, accept, maxSize, onFileSelect, error, file }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (selectedFile: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 100)

    onFileSelect(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    onFileSelect(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          aria-describedby={error ? `${label}-error` : undefined}
        />

        {file ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="ml-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {accept.toUpperCase()} up to {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p id={`${label}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
