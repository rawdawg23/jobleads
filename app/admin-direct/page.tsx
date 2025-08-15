import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminDirectClient from "./admin-direct-client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AdminDirectPage() {
  // Server-side authentication check
  const cookieStore = await cookies()

  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Check if user is authenticated and is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

      if (userProfile?.role === "admin") {
        redirect("/admin")
      }
    }
  } catch (error) {
    console.error("[v0] Server auth check error:", error)
  }

  return <AdminDirectClient />
}
