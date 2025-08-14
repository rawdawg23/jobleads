import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
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

    const { jobId } = params

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("customer_id", user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference_id", jobId)
      .eq("user_id", user.id)
      .eq("payment_type", "job_posting")
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Generate bank transfer reference if not exists
    if (!payment.bank_transfer_reference) {
      const reference = `ECU${jobId.slice(-8).toUpperCase()}`

      const { error: updateError } = await supabase
        .from("payments")
        .update({ bank_transfer_reference: reference })
        .eq("id", payment.id)

      if (!updateError) {
        payment.bank_transfer_reference = reference
      }
    }

    return NextResponse.json({
      job,
      payment,
      success: true,
    })
  } catch (error) {
    console.error("Payment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
