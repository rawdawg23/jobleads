import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret")

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)

    return NextResponse.json({
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      account_type: payload.account_type,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
