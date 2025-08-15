// Simplified admin user creation script
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createAdmin() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from("users")
    .upsert({
      email: "ogstorage25@gmail.com",
      first_name: "Admin",
      last_name: "User",
      role: "admin",
    })
    .select()

  if (error) {
    console.error("Error:", error)
  } else {
    console.log("Admin user created:", data)
  }
}

createAdmin()
