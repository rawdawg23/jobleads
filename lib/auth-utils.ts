import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserWithRole() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData } = await supabase
    .from("users")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single()

  return {
    ...user,
    role: userData?.role || "customer",
    first_name: userData?.first_name,
    last_name: userData?.last_name,
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getUserWithRole()
  if (!user) {
    redirect("/auth/login")
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/") // Redirect to home if role not allowed
  }

  return user
}

export function getRedirectPath(role: string) {
  switch (role) {
    case "admin":
      return "/admin"
    case "dealer":
      return "/dealer"
    case "customer":
    default:
      return "/dashboard"
  }
}
