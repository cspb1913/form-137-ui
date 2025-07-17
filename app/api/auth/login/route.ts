import { handleLogin } from "@auth0/nextjs-auth0"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    return await handleLogin(req, {
      returnTo: "/dashboard",
    })
  } catch (error) {
    console.error(error)
    // Handle error appropriately
    return new Response("Error during login", { status: 500 })
  }
}
