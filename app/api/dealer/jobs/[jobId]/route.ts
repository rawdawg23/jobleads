import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
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

    // Get dealer profile
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer profile not found or not active" }, { status: 404 })
    }

    const { jobId } = params

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        customer:users!jobs_customer_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq("id", jobId)
      .eq("status", "pending")
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found or no longer available" }, { status: 404 })
    }

    // Calculate distance between dealer and job
    let distance = 0
    if (dealer.business_latitude && dealer.business_longitude && job.customer_latitude && job.customer_longitude) {
      distance = calculateDistance(
        dealer.business_latitude,
        dealer.business_longitude,
        job.customer_latitude,
        job.customer_longitude,
      )
    }

    // Check if job is within dealer's service radius
    if (distance > dealer.radius_miles) {
      return NextResponse.json({ error: "Job is outside your service area" }, { status: 403 })
    }

    return NextResponse.json({
      job: {
        ...job,
        distance_miles: distance,
      },
      success: true,
    })
  } catch (error) {
    console.error("Job details fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
