"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { BotIDProvider } from "@/components/botid-provider"
import { Toaster } from "@/components/ui/sonner"
import { UserProvider } from "@auth0/nextjs-auth0/client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <BotIDProvider>{children}</BotIDProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </UserProvider>
  )
}
