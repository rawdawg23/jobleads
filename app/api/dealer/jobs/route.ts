import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    // Use real UK postcode API (postcodes.io)
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
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Dealer profile not found or not active" }, { status: 404 })
    }

    // Get dealer coordinates
    let dealerCoords = { lat: dealer.business_latitude, lng: dealer.business_longitude }

    // If coordinates not stored, get them from real postcode API
    if (!dealerCoords.lat || !dealerCoords.lng) {
      const coords = await getCoordinatesFromPostcode(dealer.business_postcode)
      if (coords) {
        dealerCoords = coords
        // Update dealer record with real coordinates
        await supabase
          .from("dealers")
          .update({
            business_latitude: coords.lat,
            business_longitude: coords.lng,
          })
          .eq("id", dealer.id)
      }
    }

    // Get all pending jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        *,
        customer:users!jobs_customer_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq("status", "pending")
      .is("dealer_id", null)

    if (jobsError) {
      console.error("Jobs fetch error:", jobsError)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Calculate distances and filter jobs within dealer's radius
    const jobsWithDistance = []

    for (const job of jobs || []) {
      // Get job coordinates
      let jobCoords = { lat: job.customer_latitude, lng: job.customer_longitude }

      // If coordinates not stored, get them from real postcode API
      if (!jobCoords.lat || !jobCoords.lng) {
        const coords = await getCoordinatesFromPostcode(job.customer_postcode)
        if (coords) {
          jobCoords = coords
          // Update job record with real coordinates
          await supabase
            .from("jobs")
            .update({
              customer_latitude: coords.lat,
              customer_longitude: coords.lng,
            })
            .eq("id", job.id)
        }
      }

      // Calculate distance using real coordinates
      if (dealerCoords.lat && dealerCoords.lng && jobCoords.lat && jobCoords.lng) {
        const distance = calculateDistance(dealerCoords.lat, dealerCoords.lng, jobCoords.lat, jobCoords.lng)

        // Only include jobs within dealer's service radius
        if (distance <= dealer.radius_miles) {
          jobsWithDistance.push({
            ...job,
            distance_miles: distance,
          })
        }
      }
    }

    return NextResponse.json({
      jobs: jobsWithDistance,
      dealerLocation: dealer.business_postcode,
      success: true,
    })
  } catch (error) {
    console.error("Dealer jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
