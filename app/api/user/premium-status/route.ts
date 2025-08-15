import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ hasPremiumAccess: false }, { status: 401 })
    }

    // Check for active premium subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .single()

    if (subError && subError.code !== "PGRST116") {
      console.error("Error checking subscription:", subError)
      return NextResponse.json({ hasPremiumAccess: false }, { status: 500 })
    }

    const hasPremiumAccess = !!subscription && subscription.subscription_type !== "basic"

    return NextResponse.json({
      hasPremiumAccess,
      subscription: subscription || null,
    })
  } catch (error) {
    console.error("Error in premium status check:", error)
    return NextResponse.json({ hasPremiumAccess: false }, { status: 500 })
  }
}
