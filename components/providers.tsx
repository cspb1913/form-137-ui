"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { BotIDProvider } from "@/components/botid-provider"
import { Toaster } from "@/components/ui/sonner"
import { Auth0Provider } from "@auth0/nextjs-auth0"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <BotIDProvider>{children}</BotIDProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </Auth0Provider>
  )
}
