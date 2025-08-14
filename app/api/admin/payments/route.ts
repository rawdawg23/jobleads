import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userProfile || userProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all payments with related data
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select(`
        *,
        user:users!payments_user_id_fkey (
          first_name,
          last_name,
          email
        ),
        job:jobs!payments_reference_id_fkey (
          registration,
          make,
          model
        ),
        dealer:dealers!payments_reference_id_fkey (
          business_name
        )
      `)
      .order("created_at", { ascending: false })

    if (paymentsError) {
      console.error("Payments fetch error:", paymentsError)
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    return NextResponse.json({
      payments: payments || [],
      success: true,
    })
  } catch (error) {
    console.error("Admin payments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
