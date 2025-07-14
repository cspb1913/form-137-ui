"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { detectBot, trackSuspiciousActivity } from "@/lib/botid"

interface BotIDContextType {
  isBot: boolean
  botType: string | null
  confidence: number
  isLoading: boolean
  trackActivity: (activityType: string, details: any) => Promise<void>
}

const BotIDContext = createContext<BotIDContextType | undefined>(undefined)

export function BotIDProvider({ children }: { children: React.ReactNode }) {
  const [botDetection, setBotDetection] = useState({
    isBot: false,
    botType: null as string | null,
    confidence: 0,
    isLoading: true,
  })

  useEffect(() => {
    const performBotDetection = async () => {
      try {
        const result = await detectBot()
        setBotDetection({
          isBot: result.isBot,
          botType: result.botType,
          confidence: result.confidence,
          isLoading: false,
        })

        // Track if bot is detected
        if (result.isBot) {
          await trackSuspiciousActivity("bot_detected", {
            botType: result.botType,
            confidence: result.confidence,
            userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
            details: result.details,
          })
        }
      } catch (error) {
        console.error("Bot detection failed:", error)
        setBotDetection((prev) => ({ ...prev, isLoading: false }))
      }
    }

    performBotDetection()
  }, [])

  const trackActivity = async (activityType: string, details: any) => {
    await trackSuspiciousActivity(activityType, {
      ...details,
      isBot: botDetection.isBot,
      botType: botDetection.botType,
      confidence: botDetection.confidence,
    })
  }

  return (
    <BotIDContext.Provider
      value={{
        isBot: botDetection.isBot,
        botType: botDetection.botType,
        confidence: botDetection.confidence,
        isLoading: botDetection.isLoading,
        trackActivity,
      }}
    >
      {children}
    </BotIDContext.Provider>
  )
}

export function useBotID() {
  const context = useContext(BotIDContext)
  if (context === undefined) {
    throw new Error("useBotID must be used within a BotIDProvider")
  }
  return context
}
