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
      console.error(`Postcode API error: ${response.status}`)
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

export async function GET(request: NextRequest) {
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

    // Get dealer coordinates from postcode
    const dealerCoords = await getCoordinatesFromPostcode(dealer.postcode)
    if (!dealerCoords) {
      return NextResponse.json({ error: "Could not determine dealer location" }, { status: 400 })
    }

    const { data: allJobs, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        *,
        customer:users!jobs_customer_id_fkey(first_name, last_name)
      `)
      .eq("status", "pending")
      .is("dealer_id", null)

    if (jobsError) {
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Calculate distances and filter jobs within dealer's radius
    const jobsWithDistance = []

    for (const job of allJobs || []) {
      const jobCoords = await getCoordinatesFromPostcode(job.customer_postcode)

      if (jobCoords) {
        const distance = calculateDistance(dealerCoords.lat, dealerCoords.lng, jobCoords.lat, jobCoords.lng)

        // Only include jobs within dealer's service radius (default 50 miles)
        const radiusMiles = dealer.radius_miles || 50
        if (distance <= radiusMiles) {
          jobsWithDistance.push({
            ...job,
            distance_miles: distance,
            customer: job.customer
              ? {
                  first_name: job.customer.first_name,
                  last_name: job.customer.last_name,
                }
              : null,
          })
        }
      }
    }

    return NextResponse.json({
      jobs: jobsWithDistance,
      dealerLocation: dealer.postcode,
      success: true,
    })
  } catch (error) {
    console.error("Dealer jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
