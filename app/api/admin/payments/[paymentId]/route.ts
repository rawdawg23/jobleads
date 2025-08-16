import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const supabase = createClient()

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

    const { paymentId } = await params
    const { status, admin_notes } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Get payment details first
    const { data: payment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single()

    if (paymentFetchError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status,
        admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)

    if (updateError) {
      console.error("Payment update error:", updateError)
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
    }

    // If payment is completed, handle related actions
    if (status === "completed" && payment.status !== "completed") {
      if (payment.payment_type === "job_posting") {
        // Activate job posting
        await supabase.from("jobs").update({ status: "pending" }).eq("id", payment.reference_id)
      } else if (payment.payment_type === "dealer_subscription") {
        // Activate dealer account and set subscription expiry
        const subscriptionExpiry = new Date()
        subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1)

        await supabase
          .from("dealers")
          .update({
            status: "active",
            subscription_expires_at: subscriptionExpiry.toISOString(),
          })
          .eq("id", payment.reference_id)
      }
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Payment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
