import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: dynoSessions, error } = await supabase
      .from("dyno_sessions")
      .select(`
        *,
        vehicle:vehicles(make, model, year, engine_size),
        user:users(first_name, last_name)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Database error:", error)
      return Response.json({ error: "Failed to fetch dyno data" }, { status: 500 })
    }

    // Get latest sensor readings
    const { data: sensorData, error: sensorError } = await supabase
      .from("sensor_readings")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single()

    const liveData = {
      activeSessions: dynoSessions?.length || 0,
      currentPower: sensorData?.power_hp || 0,
      currentTorque: sensorData?.torque_nm || 0,
      ecuTemp: sensorData?.ecu_temp || 0,
      fuelPressure: sensorData?.fuel_pressure || 0,
      batteryVoltage: sensorData?.battery_voltage || 0,
      rpm: sensorData?.rpm || 0,
      sessions: dynoSessions || [],
    }

    return Response.json(liveData)
  } catch (error) {
    console.error("Dyno API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
