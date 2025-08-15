import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role: role === "dealer" ? "dealer" : "customer",
    }

    cookies().set("ctek-session", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Registration failed" })
  }
}
