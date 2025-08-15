import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "50"

    const supabase = createClient()

    let query = supabase
      .from("car_meet_locations")
      .select(`
        *,
        organizer:users(first_name, last_name, email)
      `)
      .eq("status", "active")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })

    if (lat && lng) {
      query = query.rpc("nearby_car_meets", {
        lat: Number.parseFloat(lat),
        lng: Number.parseFloat(lng),
        radius_km: Number.parseInt(radius),
      })
    }

    const { data: carMeets, error } = await query

    if (error) {
      console.error("Database error:", error)
      return Response.json({ error: "Failed to fetch car meets" }, { status: 500 })
    }

    return Response.json({ carMeets })
  } catch (error) {
    console.error("Car meets API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meetData = await request.json()

    const { data: newMeet, error } = await supabase
      .from("car_meet_locations")
      .insert({
        title: meetData.title,
        description: meetData.description,
        location_name: meetData.locationName,
        latitude: meetData.latitude,
        longitude: meetData.longitude,
        event_date: meetData.eventDate,
        event_time: meetData.eventTime,
        max_attendees: meetData.maxAttendees,
        entry_fee: meetData.entryFee,
        meet_type: meetData.meetType,
        organizer_id: user.id,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return Response.json({ error: "Failed to create car meet" }, { status: 500 })
    }

    return Response.json({ success: true, meet: newMeet })
  } catch (error) {
    console.error("Create car meet error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
