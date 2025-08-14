import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"

export async function GET(request: NextRequest) {
  try {
    const result = await AuthService.getCurrentUser()

    if (!result) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      user: result.user,
      session: {
        id: result.session.id,
        expiresAt: result.session.expiresAt,
      },
    })
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
