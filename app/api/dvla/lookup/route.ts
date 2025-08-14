import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { registration } = await request.json()

    if (!registration) {
      return NextResponse.json({ error: "Registration number is required" }, { status: 400 })
    }

    const dvlaApiKey = process.env.DVLA_API_KEY || "8RjG3YjBwp3Y1FG4fdBnT4TtWWo8g74S5z4HsW0x"

    if (!dvlaApiKey) {
      return NextResponse.json({ error: "DVLA API not configured" }, { status: 500 })
    }

    try {
      const response = await fetch(`https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": dvlaApiKey,
        },
        body: JSON.stringify({
          registrationNumber: registration.replace(/\s+/g, "").toUpperCase(),
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: "Vehicle not found in DVLA database" }, { status: 404 })
        }
        throw new Error(`DVLA API error: ${response.status}`)
      }

      const dvlaData = await response.json()

      // Map DVLA response to our format
      const vehicleData = {
        make: dvlaData.make,
        model: dvlaData.model,
        year: dvlaData.yearOfManufacture,
        engineSize: dvlaData.engineCapacity ? `${dvlaData.engineCapacity}cc` : "Unknown",
        fuelType: dvlaData.fuelType,
        colour: dvlaData.colour,
        co2Emissions: dvlaData.co2Emissions,
        euroStatus: dvlaData.euroStatus,
        taxStatus: dvlaData.taxStatus,
        motStatus: dvlaData.motStatus,
      }

      return NextResponse.json({
        vehicle: vehicleData,
        success: true,
      })
    } catch (apiError) {
      console.error("DVLA API error:", apiError)
      return NextResponse.json({ error: "Failed to lookup vehicle data from DVLA" }, { status: 500 })
    }
  } catch (error) {
    console.error("DVLA lookup error:", error)
    return NextResponse.json({ error: "Failed to lookup vehicle data" }, { status: 500 })
  }
}
