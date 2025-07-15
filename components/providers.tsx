"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { BotIDProvider } from "@/components/botid-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <BotIDProvider>
        {children}
        <Toaster />
      </BotIDProvider>
    </ThemeProvider>
  )
}
