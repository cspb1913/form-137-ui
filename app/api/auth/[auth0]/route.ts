import { NextRequest } from "next/server"
import { auth0 } from "@/lib/auth0"

export function GET(request: NextRequest) {
  return auth0.authClient.handler(request)
}

export function POST(request: NextRequest) {
  return auth0.authClient.handler(request)
}
