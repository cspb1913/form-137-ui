import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"

// Log Auth0 environment variables on app start
if (typeof window === "undefined") {
  // Only log on server side to avoid exposing secrets to the browser
  // eslint-disable-next-line no-console
  console.log("Auth0 ENV:", {
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  })
}

export const metadata: Metadata = {
  title: "Form 137 Request Portal",
  description: "A streamlined portal for requesting and managing Form 137.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
