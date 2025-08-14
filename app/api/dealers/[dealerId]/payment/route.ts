import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { dealerId: string } }) {
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

    const { dealerId } = params

    // Get dealer details
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("id", dealerId)
      .eq("user_id", user.id)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference_id", dealerId)
      .eq("user_id", user.id)
      .eq("payment_type", "dealer_subscription")
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Generate bank transfer reference if not exists
    if (!payment.bank_transfer_reference) {
      const reference = `DEALER${dealerId.slice(-8).toUpperCase()}`

      const { error: updateError } = await supabase
        .from("payments")
        .update({ bank_transfer_reference: reference })
        .eq("id", payment.id)

      if (!updateError) {
        payment.bank_transfer_reference = reference
      }
    }

    return NextResponse.json({
      dealer,
      payment,
      success: true,
    })
  } catch (error) {
    console.error("Dealer payment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
