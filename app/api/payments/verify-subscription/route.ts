import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .single()

    const hasActiveSubscription = !!subscription && !error

    return Response.json({
      hasActiveSubscription,
      subscription: subscription || null,
      expiresAt: subscription?.expires_at || null,
    })
  } catch (error) {
    console.error("Subscription verification error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
