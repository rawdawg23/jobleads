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
    const message = formData.get("message") as string

    // Validate required fields
    if (!jobId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Verify job access
    const { data: job } = await supabase.from("jobs").select("customer_id").eq("id", jobId).single()

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check permissions
    if (profile.role === "customer" && job.customer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to job" }, { status: 403 })
    }

    if (profile.role === "dealer") {
      if (!dealerId) {
        return NextResponse.json({ error: "Dealer ID required" }, { status: 400 })
      }

      // Verify dealer ownership
      const { data: dealer } = await supabase
        .from("dealers")
        .select("id")
        .eq("id", dealerId)
        .eq("user_id", user.id)
        .single()

      if (!dealer) {
        return NextResponse.json({ error: "Unauthorized dealer access" }, { status: 403 })
      }

      // Check if dealer has applied to this job
      const { data: application } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("dealer_id", dealerId)
        .single()

      if (!application) {
        return NextResponse.json({ error: "Must apply to job before messaging" }, { status: 403 })
      }
    }

    // Create message
    const { error } = await supabase.from("messages").insert({
      job_id: jobId,
      dealer_id: dealerId || null,
      sender_id: user.id,
      content: message.trim(),
    })

    if (error) {
      console.error("Error creating message:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.redirect(new URL(`/messages/${jobId}`, request.url))
  } catch (error) {
    console.error("Error in message sending:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
