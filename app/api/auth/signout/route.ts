import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("ctek-session")?.value

    if (sessionId) {
      await AuthService.signOut(sessionId)
    }

    const response = NextResponse.json({ success: true })

    // Clear session cookie
    response.cookies.delete("ctek-session")

    return response
  } catch (error) {
    console.error("Sign out API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
