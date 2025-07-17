import { handleCallback } from "@auth0/nextjs-auth0"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    return await handleCallback(req)
  } catch (error) {
    console.error(error)
    // Handle error appropriately
    return new Response("Error during callback", { status: 500 })
  }
}
