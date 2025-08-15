import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const MOCK_USERS = [
  { id: "1", email: "admin@ctek.com", password: "admin123", name: "Admin User", role: "admin" },
  { id: "2", email: "dealer@ctek.com", password: "dealer123", name: "Dealer User", role: "dealer" },
  { id: "3", email: "customer@ctek.com", password: "customer123", name: "Customer User", role: "customer" },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (user) {
      cookies().set("ctek-session", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ success: true, user: userWithoutPassword })
    } else {
      return NextResponse.json({ success: false, error: "Invalid credentials" })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Login failed" })
  }
}
