import { type NextRequest, NextResponse } from "next/server"
import { SessionModel, UserModel } from "@/lib/redis/models"
import { DealerModel, JobModel } from "@/lib/redis/extended-models"

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
    const sessionId = request.cookies.get("ctek-session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = await SessionModel.findById(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = await UserModel.findById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const dealer = await DealerModel.findByUserId(user.id)
    if (!dealer || dealer.status !== "active") {
      return NextResponse.json({ error: "Dealer profile not found or not active" }, { status: 404 })
    }

    // Get dealer coordinates from postcode
    const dealerCoords = await getCoordinatesFromPostcode(dealer.businessPostcode)
    if (!dealerCoords) {
      return NextResponse.json({ error: "Could not determine dealer location" }, { status: 400 })
    }

    const allJobs = await JobModel.findAll()
    const pendingJobs = allJobs.filter((job) => job.status === "pending" && !job.dealerId)

    // Calculate distances and filter jobs within dealer's radius
    const jobsWithDistance = []

    for (const job of pendingJobs) {
      const jobCoords = await getCoordinatesFromPostcode(job.customerPostcode)

      if (jobCoords) {
        const distance = calculateDistance(dealerCoords.lat, dealerCoords.lng, jobCoords.lat, jobCoords.lng)

        // Only include jobs within dealer's service radius
        if (distance <= dealer.radiusMiles) {
          // Get customer info
          const customer = await UserModel.findById(job.customerId)
          jobsWithDistance.push({
            ...job,
            distance_miles: distance,
            customer: customer
              ? {
                  first_name: customer.firstName,
                  last_name: customer.lastName,
                }
              : null,
          })
        }
      }
    }

    return NextResponse.json({
      jobs: jobsWithDistance,
      dealerLocation: dealer.businessPostcode,
      success: true,
    })
  } catch (error) {
    console.error("Dealer jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
