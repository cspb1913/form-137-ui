import { auth0 } from "@/lib/auth0"
import type { NextRequest } from "next/server"

export function GET(req: NextRequest) {
  return auth0.handleLogin(req, { returnTo: "/dashboard" })
}
