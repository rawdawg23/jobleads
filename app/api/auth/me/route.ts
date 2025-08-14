import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("ctek-session")?.value

    if (!sessionId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const result = await AuthService.getCurrentUser()

    if (!result) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
