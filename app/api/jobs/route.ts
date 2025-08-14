import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
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

    const { registration, postcode, serviceType, description, requiredTools, vehicleData } = await request.json()

    if (!registration || !postcode || !serviceType || !description || !vehicleData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        customer_id: user.id,
        registration: registration.toUpperCase(),
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        engine_size: vehicleData.engineSize,
        fuel_type: vehicleData.fuelType,
        service_type: serviceType,
        description,
        required_tools: requiredTools,
        customer_postcode: postcode.toUpperCase(),
        status: "pending",
      })
      .select()
      .single()

    if (jobError) {
      console.error("Job creation error:", jobError)
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      amount: 5.0,
      currency: "GBP",
      payment_type: "job_posting",
      reference_id: job.id,
      status: "pending",
    })

    if (paymentError) {
      console.error("Payment creation error:", paymentError)
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
    }

    return NextResponse.json({
      jobId: job.id,
      success: true,
    })
  } catch (error) {
    console.error("Job creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
