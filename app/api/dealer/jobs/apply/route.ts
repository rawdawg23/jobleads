import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const jobId = formData.get("jobId") as string
    const dealerId = formData.get("dealerId") as string
    const quote = Number.parseFloat(formData.get("quote") as string)
    const estimatedDuration = Number.parseFloat(formData.get("estimated_duration") as string)
    const message = formData.get("message") as string
    const availableTools = formData.get("available_tools") as string
    const experience = formData.get("experience") as string

    // Validate required fields
    if (!jobId || !dealerId || !quote || !estimatedDuration || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify dealer ownership
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id, user_id")
      .eq("id", dealerId)
      .eq("user_id", user.id)
      .single()

    if (!dealer) {
      return NextResponse.json({ error: "Unauthorized dealer access" }, { status: 403 })
    }

    // Check if job exists and is open
    const { data: job } = await supabase.from("jobs").select("id, status").eq("id", jobId).eq("status", "open").single()

    if (!job) {
      return NextResponse.json({ error: "Job not found or not available" }, { status: 404 })
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("dealer_id", dealerId)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 })
    }

    // Create job application
    const { data: application, error } = await supabase
      .from("job_applications")
      .insert({
        job_id: jobId,
        dealer_id: dealerId,
        quote_amount: quote,
        estimated_duration: estimatedDuration,
        message,
        available_tools: availableTools,
        experience,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating application:", error)
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }

    return NextResponse.redirect(new URL(`/dealer/jobs/${jobId}`, request.url))
  } catch (error) {
    console.error("Error in job application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
