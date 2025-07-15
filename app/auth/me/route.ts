import { auth0 } from "@/lib/auth0"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth0.getSession()
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    return NextResponse.json({ user: session.user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
