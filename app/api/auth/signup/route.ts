import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber || "",
          role: role || "customer",
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If user is created, also create profile in users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: role || "customer",
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
      }
    }

    return NextResponse.json({
      user: data.user,
      message: "Check your email to confirm your account.",
    })
  } catch (error) {
    console.error("Sign up API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
