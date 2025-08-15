import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const location = searchParams.get("location")
    const search = searchParams.get("search")

    let query = supabase.from("companies").select("*")

    if (location) {
      query = query.ilike("location", `%${location}%`)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ dealers: data })
  } catch (error) {
    console.error("Error fetching dealers:", error)
    return NextResponse.json({ error: "Failed to fetch dealers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase.from("companies").insert([body]).select().single()

    if (error) throw error

    return NextResponse.json({ dealer: data })
  } catch (error) {
    console.error("Error creating dealer:", error)
    return NextResponse.json({ error: "Failed to create dealer" }, { status: 500 })
  }
}
