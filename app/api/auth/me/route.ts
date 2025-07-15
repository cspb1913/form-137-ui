import { getSession } from "@auth0/nextjs-auth0"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    return NextResponse.json({ user: session.user }, { status: 200 })
  } catch (error) {
    console.error("Error fetching session in /api/auth/me:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
