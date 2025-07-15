"use client"

import type React from "react"
import { UserProvider } from "@/lib/auth0-client"
import { ThemeProvider } from "@/components/theme-provider"
import { BotIDProvider } from "@/components/botid-provider"
import { Toaster as Sonner } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <BotIDProvider>
          {children}
          <Sonner
            position="top-right"
            toastOptions={{
              style: {
                background: "white",
                border: "1px solid #1B4332",
                color: "#1B4332",
              },
            }}
          />
        </BotIDProvider>
      </ThemeProvider>
    </UserProvider>
  )
}
