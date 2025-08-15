import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get current user from auth header or session
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const jobId = formData.get("jobId") as string
    const dealerId = formData.get("dealerId") as string
    const message = formData.get("message") as string

    // Validate required fields
    if (!jobId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", jobId).single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check permissions based on user role
    if (profile.role === "customer" && job.customer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to job" }, { status: 403 })
    }

    if (profile.role === "dealer") {
      if (!dealerId) {
        return NextResponse.json({ error: "Dealer ID required" }, { status: 400 })
      }

      const { data: dealer, error: dealerError } = await supabase
        .from("dealers")
        .select("*")
        .eq("id", dealerId)
        .eq("user_id", user.id)
        .single()

      if (dealerError || !dealer) {
        return NextResponse.json({ error: "Unauthorized dealer access" }, { status: 403 })
      }
    }

    // Determine recipient based on sender role
    let recipientId: string
    if (profile.role === "customer") {
      if (!dealerId) {
        return NextResponse.json({ error: "Dealer ID required for customer messages" }, { status: 400 })
      }
      const { data: dealer, error: dealerError } = await supabase
        .from("dealers")
        .select("user_id")
        .eq("id", dealerId)
        .single()

      if (dealerError || !dealer) {
        return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
      }
      recipientId = dealer.user_id
    } else {
      recipientId = job.customer_id
    }

    const { error: messageError } = await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: user.id,
      recipient_id: recipientId,
      dealer_id: dealerId || null,
      content: message.trim(),
    })

    if (messageError) {
      console.error("Error creating message:", messageError)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.redirect(new URL(`/messages/${jobId}`, request.url))
  } catch (error) {
    console.error("Error in message sending:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
