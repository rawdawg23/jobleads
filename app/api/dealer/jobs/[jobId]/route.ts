import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

async function getCoordinatesFromPostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const normalizedPostcode = postcode.replace(/\s+/g, "").toUpperCase()
    const response = await fetch(`https://api.postcodes.io/postcodes/${normalizedPostcode}`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data.status === 200 && data.result) {
      return {
        lat: data.result.latitude,
        lng: data.result.longitude,
      }
    }

    return null
  } catch (error) {
    console.error("Postcode lookup error:", error)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: dealer, error: dealerError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .eq("role", "dealer")
      .single()

    if (dealerError || !dealer || dealer.status !== "active") {
      return NextResponse.json({ error: "Dealer profile not found or not active" }, { status: 404 })
    }

    const { jobId } = params

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        customer:users!jobs_customer_id_fkey(first_name, last_name)
      `)
      .eq("id", jobId)
      .eq("status", "pending")
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found or no longer available" }, { status: 404 })
    }

    // Calculate distance between dealer and job
    const dealerCoords = await getCoordinatesFromPostcode(dealer.postcode)
    const jobCoords = await getCoordinatesFromPostcode(job.customer_postcode)

    let distance = 0
    if (dealerCoords && jobCoords) {
      distance = calculateDistance(dealerCoords.lat, dealerCoords.lng, jobCoords.lat, jobCoords.lng)
    }

    // Check if job is within dealer's service radius
    const radiusMiles = dealer.radius_miles || 50
    if (distance > radiusMiles) {
      return NextResponse.json({ error: "Job is outside your service area" }, { status: 403 })
    }

    return NextResponse.json({
      job: {
        ...job,
        distance_miles: distance,
        customer: job.customer
          ? {
              first_name: job.customer.first_name,
              last_name: job.customer.last_name,
            }
          : null,
      },
      success: true,
    })
  } catch (error) {
    console.error("Job details fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
