import { type NextRequest, NextResponse } from "next/server"

const ECU_DATABASE = {
  // Common ECU types by manufacturer and engine
  getEcuInfo: (make: string, model: string, year: number, engineSize: string, fuelType: string) => {
    const makeUpper = make.toUpperCase()
    const modelUpper = model.toUpperCase()
    const capacity = Number.parseInt(engineSize.replace(/[^\d]/g, "")) || 0

    // ECU mapping based on common vehicle configurations
    if (makeUpper.includes("BMW")) {
      if (fuelType === "DIESEL") {
        return {
          ecuType: capacity > 2500 ? "Bosch EDC17CP45" : "Bosch EDC17C50",
          readMethod: "OBD + Bench",
          estimatedPower: `${Math.round(capacity * 0.08)}hp`,
          estimatedTorque: `${Math.round(capacity * 0.25)}Nm`,
          remapPotential: "+25-35% Power, +30-40% Torque",
          tools: ["KESS V2", "CMD Flash", "AutoTuner"],
        }
      } else {
        return {
          ecuType: capacity > 2500 ? "Bosch MED17.2" : "Bosch MEV17.2.2",
          readMethod: "OBD",
          estimatedPower: `${Math.round(capacity * 0.1)}hp`,
          estimatedTorque: `${Math.round(capacity * 0.2)}Nm`,
          remapPotential: "+15-25% Power, +20-30% Torque",
          tools: ["KESS V2", "KTAG", "CMD Flash"],
        }
      }
    }

    if (
      makeUpper.includes("AUDI") ||
      makeUpper.includes("VOLKSWAGEN") ||
      makeUpper.includes("SEAT") ||
      makeUpper.includes("SKODA")
    ) {
      if (fuelType === "DIESEL") {
        return {
          ecuType: year > 2015 ? "Bosch EDC17CP20" : "Bosch EDC16U34",
          readMethod: "OBD + BDM",
          estimatedPower: `${Math.round(capacity * 0.075)}hp`,
          estimatedTorque: `${Math.round(capacity * 0.28)}Nm`,
          remapPotential: "+30-40% Power, +35-45% Torque",
          tools: ["KESS V2", "KTAG", "BDM100"],
        }
      } else {
        return {
          ecuType: "Bosch MED17.5.5",
          readMethod: "OBD",
          estimatedPower: `${Math.round(capacity * 0.09)}hp`,
          estimatedTorque: `${Math.round(capacity * 0.18)}Nm`,
          remapPotential: "+20-30% Power, +25-35% Torque",
          tools: ["KESS V2", "MPPS V21", "Galletto 1260"],
        }
      }
    }

    if (makeUpper.includes("FORD")) {
      if (fuelType === "DIESEL") {
        return {
          ecuType: "Siemens SID807",
          readMethod: "OBD + Bench",
          estimatedPower: `${Math.round(capacity * 0.07)}hp`,
          estimatedTorque: `${Math.round(capacity * 0.26)}Nm`,
          remapPotential: "+25-35% Power, +30-40% Torque",
          tools: ["KESS V2", "CMD Flash", "Dimsport New Genius"],
        }
      } else {
        return {
          ecuType: "Bosch ME7.9.6",
          readMethod: "OBD",
          estimatedPower: `${Math.round(capacity * 0.085)}hp`,
          estimatedTorque: `${Math.round(capacity * 0.16)}Nm`,
          remapPotential: "+15-25% Power, +20-30% Torque",
          tools: ["KESS V2", "KTAG", "AutoTuner"],
        }
      }
    }

    // Default ECU info for other manufacturers
    return {
      ecuType: fuelType === "DIESEL" ? "Bosch EDC16/17 Series" : "Bosch ME7/MED17 Series",
      readMethod: "OBD + Bench/BDM",
      estimatedPower: `${Math.round(capacity * 0.08)}hp`,
      estimatedTorque: `${Math.round(capacity * 0.22)}Nm`,
      remapPotential: "+20-30% Power, +25-35% Torque",
      tools: ["KESS V2", "KTAG", "CMD Flash"],
    }
  },
}

export async function POST(request: NextRequest) {
  try {
    const { registration } = await request.json()

    if (!registration) {
      return NextResponse.json({ error: "Registration number is required" }, { status: 400 })
    }

    const dvlaApiKey = process.env.DVLA_API_KEY

    if (!dvlaApiKey) {
      console.warn("DVLA API key not configured, returning mock data")
      // Return mock data instead of crashing
      const mockVehicleData = {
        make: "BMW",
        model: "320d",
        year: 2020,
        engineSize: "2000cc",
        fuelType: "DIESEL",
        colour: "Black",
        co2Emissions: 120,
        euroStatus: "EURO 6",
        taxStatus: "Taxed",
        motStatus: "Valid",
        ecuInfo: {
          ecuType: "Bosch EDC17CP45",
          readMethod: "OBD + Bench",
          estimatedPower: "160hp",
          estimatedTorque: "500Nm",
          remapPotential: "+25-35% Power, +30-40% Torque",
          recommendedTools: ["KESS V2", "CMD Flash", "AutoTuner"],
          complexity: "Medium-High",
          estimatedTime: "2-4 hours",
          warranty: "Available with professional installation",
        },
      }

      return NextResponse.json({
        vehicle: mockVehicleData,
        success: true,
        mock: true,
      })
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
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: "Vehicle not found in DVLA database" }, { status: 404 })
        }
        throw new Error(`DVLA API error: ${response.status}`)
      }

      const dvlaData = await response.json()

      const engineSize = dvlaData.engineCapacity ? `${dvlaData.engineCapacity}cc` : "Unknown"
      const ecuInfo = ECU_DATABASE.getEcuInfo(
        dvlaData.make,
        dvlaData.model,
        dvlaData.yearOfManufacture,
        engineSize,
        dvlaData.fuelType,
      )

      const vehicleData = {
        // Basic DVLA data
        make: dvlaData.make,
        model: dvlaData.model,
        year: dvlaData.yearOfManufacture,
        engineSize,
        fuelType: dvlaData.fuelType,
        colour: dvlaData.colour,
        co2Emissions: dvlaData.co2Emissions,
        euroStatus: dvlaData.euroStatus,
        taxStatus: dvlaData.taxStatus,
        motStatus: dvlaData.motStatus,

        // Enhanced ECU-specific data
        ecuInfo: {
          ecuType: ecuInfo.ecuType,
          readMethod: ecuInfo.readMethod,
          estimatedPower: ecuInfo.estimatedPower,
          estimatedTorque: ecuInfo.estimatedTorque,
          remapPotential: ecuInfo.remapPotential,
          recommendedTools: ecuInfo.tools,
          complexity: dvlaData.fuelType === "DIESEL" ? "Medium-High" : "Medium",
          estimatedTime: "2-4 hours",
          warranty: "Available with professional installation",
        },
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
