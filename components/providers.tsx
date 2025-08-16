"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { BotIDProvider } from "@/components/botid-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <BotIDProvider>{children}</BotIDProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  )
}
