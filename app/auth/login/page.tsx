import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const supabase = createClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is logged in, redirect to dashboard
    if (session) {
      redirect("/dashboard")
    }
  } catch (error) {
    // Continue to show login form even if session check fails
    console.log("Session check failed, continuing to login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CTEK JOB LEADS</h1>
          <p className="text-gray-600">Welcome back to your professional network</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
