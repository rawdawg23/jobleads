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

    const { jobId } = params

    const job = await JobModel.findById(jobId)
    if (!job || job.status !== "pending") {
      return NextResponse.json({ error: "Job not found or no longer available" }, { status: 404 })
    }

    // Get customer info
    const customer = await UserModel.findById(job.customerId)

    // Calculate distance between dealer and job
    const dealerCoords = await getCoordinatesFromPostcode(dealer.businessPostcode)
    const jobCoords = await getCoordinatesFromPostcode(job.customerPostcode)

    let distance = 0
    if (dealerCoords && jobCoords) {
      distance = calculateDistance(dealerCoords.lat, dealerCoords.lng, jobCoords.lat, jobCoords.lng)
    }

    // Check if job is within dealer's service radius
    if (distance > dealer.radiusMiles) {
      return NextResponse.json({ error: "Job is outside your service area" }, { status: 403 })
    }

    return NextResponse.json({
      job: {
        ...job,
        distance_miles: distance,
        customer: customer
          ? {
              first_name: customer.firstName,
              last_name: customer.lastName,
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
