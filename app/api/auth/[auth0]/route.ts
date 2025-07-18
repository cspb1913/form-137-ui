import { auth0 } from "@/lib/auth0"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/")
  let route = segments.pop() || segments.pop()
  switch (route) {
    case "login":
      return auth0.handleLogin(request, { returnTo: "/dashboard" })
    case "logout":
      return auth0.handleLogout(request, { returnTo: "/" })
    case "callback":
      return auth0.handleCallback(request)
    case "me":
    case "profile":
      return auth0.handleProfile(request)
    case "access-token":
      return auth0.handleAccessToken(request)
    case "backchannel-logout":
      return auth0.handleBackChannelLogout(request)
    default:
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }
}
