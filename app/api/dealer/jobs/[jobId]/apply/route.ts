import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { jobId: string } }) {
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

    // Get dealer profile
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer profile not found or not active" }, { status: 404 })
    }

    const { jobId } = params

    // Check if job exists and is available
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("status", "pending")
      .is("dealer_id", null)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found or no longer available" }, { status: 404 })
    }

    // Check if dealer already applied
    const { data: existingApplication } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("dealer_id", dealer.id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }

    // Create job application
    const { error: applicationError } = await supabase.from("job_applications").insert({
      job_id: jobId,
      dealer_id: dealer.id,
      quote: 0, // Default quote, can be updated later
      message: "I am interested in this job and available to complete the work.",
    })

    if (applicationError) {
      console.error("Application creation error:", applicationError)
      return NextResponse.json({ error: "Failed to apply for job" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully applied for job",
    })
  } catch (error) {
    console.error("Job application error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
