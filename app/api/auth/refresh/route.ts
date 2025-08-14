import { type NextRequest, NextResponse } from "next/server"
import { SessionModel } from "@/lib/redis/models"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("ctek-session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const refreshedSession = await SessionModel.refresh(sessionId)

    if (!refreshedSession) {
      // Session is invalid or expired
      const response = NextResponse.json({ error: "Session expired" }, { status: 401 })
      response.cookies.delete("ctek-session")
      return response
    }

    // Update cookie with new expiration
    const response = NextResponse.json({ success: true })
    response.cookies.set("ctek-session", refreshedSession.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Session refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
