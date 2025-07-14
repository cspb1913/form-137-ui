import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { BotIDProvider } from "@/components/botid-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Request Form 137 (Learner's Permanent Record)",
  description: "Submit a request for Form 137 - Learner's Permanent Record",
  keywords: ["Form 137", "Learner's Record", "Education", "Philippines", "DepEd"],
  authors: [{ name: "CSPB Form 137 System" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <BotIDProvider>
            {children}
            <Toaster />
          </BotIDProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
