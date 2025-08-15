import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import AdminSettingsClient from "./admin-settings-client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AdminSettingsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login")
  }

  return <AdminSettingsClient />
}
