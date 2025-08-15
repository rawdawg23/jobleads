import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const job_id = searchParams.get("job_id")
    const user_id = searchParams.get("user_id")

    let query = supabase.from("applications").select(`
        *,
        jobs (
          title,
          companies (name)
        ),
        users (
          first_name,
          last_name,
          email
        )
      `)

    if (job_id) {
      query = query.eq("job_id", job_id)
    }

    if (user_id) {
      query = query.eq("user_id", user_id)
    }

    const { data, error } = await query.order("applied_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ applications: data })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          ...body,
          applied_at: new Date().toISOString(),
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ application: data })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
