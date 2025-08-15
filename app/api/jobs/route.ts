import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

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
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status")
    const location = searchParams.get("location")
    const serviceType = searchParams.get("serviceType")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase.from("jobs").select(`
        *,
        companies!jobs_company_id_fkey(
          name,
          logo_url,
          location
        ),
        applications(
          id,
          status,
          users(first_name, last_name)
        )
      `)

    if (status) {
      query = query.eq("status", status)
    }
    if (location) {
      query = query.ilike("location", `%${location}%`)
    }
    if (serviceType) {
      query = query.eq("service_type", serviceType)
    }

    if (user.user_metadata?.role === "customer") {
      query = query.eq("customer_id", user.id)
    } else if (user.user_metadata?.role === "dealer") {
      // Dealers see all active jobs they can apply to
      query = query.eq("status", "active")
    }

    const { data: jobs, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      jobs: jobs || [],
      total: jobs?.length || 0,
      hasMore: (jobs?.length || 0) === limit,
    })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
