import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    const userData = {
      email,
      firstName,
      lastName,
      phoneNumber: phoneNumber || "",
      role: role || "customer",
    }

    const result = await AuthService.signUp(userData, password)

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
    console.error("Sign up API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
