import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "customer") {
      return NextResponse.json({ error: "Only customers can accept jobs" }, { status: 403 })
    }

    const { dealerId } = await request.json()

    if (!dealerId) {
      return NextResponse.json({ error: "Dealer ID required" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "accepted",
        accepted_dealer_id: dealerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.jobId)
      .eq("customer_id", user.id)

    if (updateError) {
      console.error("[v0] Error accepting job:", updateError)
      return NextResponse.json({ error: "Failed to accept job" }, { status: 500 })
    }

    const { error: appError } = await supabase
      .from("job_applications")
      .update({ status: "accepted" })
      .eq("job_id", params.jobId)
      .eq("dealer_id", dealerId)

    if (appError) {
      console.error("[v0] Error updating application:", appError)
    }

    console.log("[v0] Job accepted successfully:", params.jobId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in job acceptance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
