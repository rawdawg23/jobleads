import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

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
        required_tools: requiredTools || [],
        customer_postcode: postcode.toUpperCase(),
        status: "pending",
      })
      .select()
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    await supabase.from("payments").insert({
      user_id: user.id,
      amount: 5.0,
      currency: "GBP",
      payment_type: "job_posting",
      reference_id: job.id,
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
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let jobs = []

    if (user.user_metadata?.role === "customer") {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })

      jobs = data || []
    } else {
      const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })

      jobs = data || []
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
