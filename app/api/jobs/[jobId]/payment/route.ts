import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { jobId } = await params

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("customer_id", user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("reference_id", jobId)
      .eq("payment_type", "job_posting")
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Generate bank transfer reference if not exists
    let updatedPayment = payment
    if (!payment.reference_id.startsWith("ECU")) {
      const reference = `ECU${jobId.slice(-8).toUpperCase()}`
      const { data: updated } = await supabase
        .from("payments")
        .update({ reference_id: reference })
        .eq("id", payment.id)
        .select()
        .single()

      updatedPayment = updated || payment
    }

    return NextResponse.json({
      job,
      payment: updatedPayment,
      success: true,
    })
  } catch (error) {
    console.error("Payment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
