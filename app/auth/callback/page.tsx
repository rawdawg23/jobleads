import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  if (typeof window === "undefined" && process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // During build time, return a simple loading page
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Processing authentication...</p>
        </div>
      </div>
    )
  }

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
