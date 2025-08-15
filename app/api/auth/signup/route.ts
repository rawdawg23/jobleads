import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber || "",
          role: role || "customer",
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sign up API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
