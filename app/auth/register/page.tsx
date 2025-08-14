"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()
          const role = userData?.role || "customer"

          switch (role) {
            case "admin":
              router.push("/admin")
              break
            case "dealer":
              router.push("/dealer")
              break
            default:
              router.push("/dashboard")
          }
        }
      } catch (error) {
        console.error("Session check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  )
}
