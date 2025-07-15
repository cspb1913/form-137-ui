import { getSession } from "@auth0/nextjs-auth0/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    return NextResponse.json({ user: session.user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
