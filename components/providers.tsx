"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { BotIDProvider } from "@/components/botid-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BotIDProvider>{children}</BotIDProvider>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
