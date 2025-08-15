// Script to create admin user with Supabase Auth
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  try {
    console.log("[v0] Creating admin user...")

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "ogstorage25@gmail.com",
      password: "EEbony2025",
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return
    }

    console.log("[v0] Auth user created:", authData.user?.id)

    // Insert/update user in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({
        id: authData.user?.id,
        email: "ogstorage25@gmail.com",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (userError) {
      console.error("[v0] User table error:", userError)
      return
    }

    console.log("[v0] Admin user created successfully:", userData)
    console.log("[v0] Email: ogstorage25@gmail.com")
    console.log("[v0] Password: EEbony2025")
    console.log("[v0] Role: admin")
  } catch (error) {
    console.error("[v0] Script error:", error)
  }
}

createAdminUser()
