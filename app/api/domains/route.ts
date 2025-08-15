import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const autoDetected = searchParams.get("auto_detected")

    let query = supabase.from("domains").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (autoDetected !== null) {
      query = query.eq("auto_detected", autoDetected === "true")
    }

    const { data: domains, error } = await query

    if (error) {
      console.error("[v0] Error fetching domains:", error)
      return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
    }

    return NextResponse.json({ domains })
  } catch (error) {
    console.error("[v0] Domains fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { domain_name, project_name } = await request.json()

    if (!domain_name) {
      return NextResponse.json({ error: "Domain name is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("domains")
      .insert({
        domain_name,
        project_name,
        user_id: user.id,
        status: "pending",
        auto_detected: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating domain:", error)
      return NextResponse.json({ error: "Failed to create domain" }, { status: 500 })
    }

    return NextResponse.json({ domain: data })
  } catch (error) {
    console.error("[v0] Domain creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
