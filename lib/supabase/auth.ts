import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export class AuthService {
  private static createServiceClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  static async signUp(
    userData: {
      email: string
      firstName: string
      lastName: string
      phoneNumber: string
      role: "customer" | "dealer" | "admin"
    },
    password: string,
  ) {
    try {
      const supabase = this.createServiceClient()

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: password,
        email_confirm: true,
      })

      if (authError) {
        return { error: authError.message }
      }

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
        })
        .select()
        .single()

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { error: profileError.message }
      }

      return { user: profileData, session: null }
    } catch (error) {
      console.error("SignUp error:", error)
      return { error: "Failed to create user account" }
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const supabase = this.createServiceClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        return { error: "Failed to load user profile" }
      }

      return { user: profile, session: data.session }
    } catch (error) {
      console.error("SignIn error:", error)
      return { error: "Failed to sign in" }
    }
  }

  static async getCurrentUser() {
    try {
      const cookieStore = cookies()
      const accessToken = cookieStore.get("sb-access-token")?.value

      if (!accessToken) return null

      const supabase = this.createServiceClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken)

      if (error || !user) return null

      // Get user profile
      const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profileError) return null

      return { user: profile, session: null }
    } catch (error) {
      console.error("getCurrentUser error:", error)
      return null
    }
  }
}
