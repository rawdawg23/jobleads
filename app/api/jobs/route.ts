import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"
import { JobModel, PaymentModel } from "@/lib/redis/extended-models"

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const result = await AuthService.getCurrentUser()

    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = result
    const { registration, postcode, serviceType, description, requiredTools, vehicleData } = await request.json()

    if (!registration || !postcode || !serviceType || !description || !vehicleData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create job record
    const job = await JobModel.create({
      customerId: user.id,
      registration: registration.toUpperCase(),
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      engineSize: vehicleData.engineSize,
      fuelType: vehicleData.fuelType,
      serviceType,
      description,
      requiredTools: requiredTools || [],
      customerPostcode: postcode.toUpperCase(),
      status: "pending",
    })

    // Create payment record
    await PaymentModel.create({
      userId: user.id,
      amount: 5.0,
      currency: "GBP",
      paymentType: "job_posting",
      referenceId: job.id,
      status: "pending",
    })

    return NextResponse.json({
      jobId: job.id,
      success: true,
    })
  } catch (error) {
    console.error("Job creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await AuthService.getCurrentUser()

    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = result
    let jobs = []

    if (user.role === "customer") {
      jobs = await JobModel.findByCustomer(user.id)
    } else {
      jobs = await JobModel.findAll()
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
