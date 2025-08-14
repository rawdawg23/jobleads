import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage() {
  // Check if user is already logged in
  const supabase = createClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is logged in, redirect to appropriate dashboard
    if (session) {
      const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()
      const role = userData?.role || "customer"

      switch (role) {
        case "admin":
          redirect("/admin")
          break
        case "dealer":
          redirect("/dealer")
          break
        default:
          redirect("/dashboard")
      }
    }
  } catch (error) {
    console.error("Auth check failed:", error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  )
}
