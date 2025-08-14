import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  const code = searchParams.code

  if (code) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        redirect("/auth/login?error=callback_failed")
      }

      if (data.user) {
        const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single()

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
      console.error("Auth callback error:", error)
      redirect("/auth/login?error=callback_failed")
    }
  }

  redirect("/dashboard")
}
