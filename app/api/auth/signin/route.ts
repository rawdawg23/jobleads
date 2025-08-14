import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await AuthService.signIn(email, password)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { user, session } = result

    const response = NextResponse.json({ user })

    // Set session cookie
    response.cookies.set("ctek-session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Sign in API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
