import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; type?: string; next?: string }>
}) {
  const params = await searchParams
  const code = params.code
  const type = params.type // This will be 'recovery' for password reset
  const next = params.next // Also check for next parameter

  if (code) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        redirect("/auth/login?error=callback_failed")
      }

      if (data.user) {
        if (type === "recovery" || next === "/auth/reset-password") {
          redirect("/auth/reset-password")
        }

        const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single()

        const role = userData?.role || "customer"

        switch (role) {
          case "admin":
            redirect("/profile/admin")
            break
          case "dealer":
            redirect("/profile/dealer")
            break
          default:
            redirect("/profile/customer")
        }
      }
    } catch (error) {
      console.error("Auth callback error:", error)
      redirect("/auth/login?error=callback_failed")
    }
  }

  redirect("/profile/customer")
}
