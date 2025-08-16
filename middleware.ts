import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth0 } from "./lib/auth0"

export async function middleware(request: NextRequest) {
  // Check if we're in development mode
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
  
  if (isDevelopmentMode) {
    // In development mode, bypass Auth0 middleware entirely
    console.log("🔧 Development Mode: Bypassing Auth0 middleware for", request.nextUrl.pathname)
    return NextResponse.next()
  }

  // In production mode, use Auth0 middleware
  console.log("🔐 Production Mode: Using Auth0 middleware for", request.nextUrl.pathname)
  return auth0.middleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap file)
     * - robots.txt (robots file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
