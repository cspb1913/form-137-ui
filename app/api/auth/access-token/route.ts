import { auth0 } from "@/lib/auth0"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 /api/auth/access-token called')
    
    // For local development, return a working token since backend auth is disabled
    console.log('🔧 Local development: returning working token')
    
    const workingToken = "localhost-dev-token-for-testing"
    
    return NextResponse.json({ 
      access_token: workingToken,
      token_type: "Bearer",
      expires_in: 86400
    })

  } catch (error) {
    console.error("❌ Failed to get access token:", error)
    return NextResponse.json(
      { 
        error: "Failed to get access token", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}