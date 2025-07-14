"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, X } from "lucide-react"
import { useBotID } from "./botid-provider"

interface BotProtectionProps {
  children: React.ReactNode
  blockThreshold?: number
  warnThreshold?: number
}

export function BotProtection({ children, blockThreshold = 0.8, warnThreshold = 0.5 }: BotProtectionProps) {
  const { isBot, botType, confidence, isLoading, trackActivity } = useBotID()
  const [showWarning, setShowWarning] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (confidence >= blockThreshold) {
        setIsBlocked(true)
        trackActivity("access_blocked", {
          reason: "high_confidence_bot",
          confidence,
          botType,
        })
      } else if (confidence >= warnThreshold) {
        setShowWarning(true)
        trackActivity("warning_shown", {
          reason: "suspicious_activity",
          confidence,
          botType,
        })
      }
    }
  }, [isLoading, confidence, blockThreshold, warnThreshold, botType, trackActivity])

  const handleDismissWarning = () => {
    setShowWarning(false)
    trackActivity("warning_dismissed", {
      confidence,
      botType,
    })
  }

  const handleBypassAttempt = () => {
    trackActivity("bypass_attempted", {
      confidence,
      botType,
      timestamp: new Date().toISOString(),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 animate-spin" />
          <span>Verifying security...</span>
        </div>
      </div>
    )
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="border-red-500">
            <Shield className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription className="mt-2">
              Automated access to this form is not permitted. If you believe this is an error, please contact support or
              try accessing the form from a different browser.
            </AlertDescription>
          </Alert>

          <div className="mt-4 text-center">
            <Button variant="outline" onClick={handleBypassAttempt} className="text-sm bg-transparent">
              Report Issue
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Debug Info:</strong>
              <br />
              Bot Type: {botType}
              <br />
              Confidence: {(confidence * 100).toFixed(1)}%<br />
              Threshold: {(blockThreshold * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {showWarning && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Security Notice</AlertTitle>
            <AlertDescription className="text-yellow-700 mt-1">
              Unusual activity detected. Please ensure you're using a standard web browser.
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissWarning}
              className="absolute top-2 right-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}
      {children}
    </>
  )
}
