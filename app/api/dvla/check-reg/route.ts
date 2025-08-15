export async function POST(request: Request) {
  try {
    const { registrationNumber } = await request.json()

    if (!registrationNumber) {
      return Response.json({ error: "Registration number is required" }, { status: 400 })
    }

    const response = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.DVLA_API_KEY!,
      },
      body: JSON.stringify({
        registrationNumber: registrationNumber.toUpperCase().replace(/\s/g, ""),
      }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ error: "Vehicle not found" }, { status: 404 })
      }
      throw new Error(`DVLA API error: ${response.status}`)
    }

    const vehicleData = await response.json()

    return Response.json({
      success: true,
      vehicle: {
        registrationNumber: vehicleData.registrationNumber,
        make: vehicleData.make,
        model: vehicleData.model,
        colour: vehicleData.colour,
        fuelType: vehicleData.fuelType,
        engineCapacity: vehicleData.engineCapacity,
        dateOfFirstRegistration: vehicleData.dateOfFirstRegistration,
        yearOfManufacture: vehicleData.yearOfManufacture,
        co2Emissions: vehicleData.co2Emissions,
        taxStatus: vehicleData.taxStatus,
        motStatus: vehicleData.motStatus,
        motExpiryDate: vehicleData.motExpiryDate,
      },
    })
  } catch (error) {
    console.error("DVLA API Error:", error)
    return Response.json({ error: "Failed to fetch vehicle data" }, { status: 500 })
  }
}
