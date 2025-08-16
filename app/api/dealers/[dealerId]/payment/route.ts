import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ dealerId: string }> }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { dealerId } = await params

    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("id", dealerId)
      .eq("user_id", user.id)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("reference_id", dealerId)
      .eq("payment_type", "dealer_subscription")
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Generate bank transfer reference if not exists
    let updatedPayment = payment
    if (!payment.reference_id.startsWith("DEALER")) {
      const reference = `DEALER${dealerId.slice(-8).toUpperCase()}`
      const { data: updated } = await supabase
        .from("payments")
        .update({ reference_id: reference })
        .eq("id", payment.id)
        .select()
        .single()

      updatedPayment = updated || payment
    }

    return NextResponse.json({
      dealer,
      payment: updatedPayment,
      success: true,
    })
  } catch (error) {
    console.error("Dealer payment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
