import { UserModel, SessionModel, type User, type Session } from "./models"
import { cookies } from "next/headers"
import { isRedisConfigured } from "./client"

export class AuthService {
  private static readonly SESSION_COOKIE_NAME = "ctek-session"
  private static readonly SESSION_DURATION_HOURS = 24 * 7 // 7 days

  static async signUp(
    userData: {
      email: string
      firstName: string
      lastName: string
      phoneNumber: string
      role: "customer" | "dealer" | "admin"
    },
    password: string,
  ): Promise<{ user: User; session: Session } | { error: string }> {
    try {
      // Check if Redis is configured
      if (!isRedisConfigured) {
        console.error("Authentication failed: Redis is not configured")
        return { 
          error: "Authentication service is not configured. Please check the console for details and contact support." 
        }
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(userData.email)
      if (existingUser) {
        return { error: "User with this email already exists" }
      }

      // Create user
      const user = await UserModel.create(userData, password)

      // Create session
      const session = await SessionModel.create(user.id, this.SESSION_DURATION_HOURS)

      return { user, session }
    } catch (error) {
      console.error("SignUp error:", error)
      return { error: "Failed to create user account" }
    }
  }

  static async signIn(email: string, password: string): Promise<{ user: User; session: Session } | { error: string }> {
    try {
      // Check if Redis is configured
      if (!isRedisConfigured) {
        console.error("Authentication failed: Redis is not configured")
        return { 
          error: "Authentication service is not configured. Please check the console for details and contact support." 
        }
      }

      // Verify credentials
      const user = await UserModel.verifyPassword(email, password)
      if (!user) {
        return { error: "Invalid email or password" }
      }

      // Create new session
      const session = await SessionModel.create(user.id, this.SESSION_DURATION_HOURS)

      return { user, session }
    } catch (error) {
      console.error("SignIn error:", error)
      // Provide more specific error information
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: "Failed to sign in. Please try again." }
    }
  }

  static async signOut(sessionId?: string): Promise<void> {
    try {
      if (sessionId) {
        await SessionModel.delete(sessionId)
      }
    } catch (error) {
      console.error("SignOut error:", error)
    }
  }

  static async getCurrentUser(): Promise<{ user: User; session: Session } | null> {
    try {
      const cookieStore = cookies()
      const sessionId = cookieStore.get(this.SESSION_COOKIE_NAME)?.value

      if (!sessionId) return null

      const session = await SessionModel.findById(sessionId)
      if (!session) return null

      const user = await UserModel.findById(session.userId)
      if (!user) return null

      return { user, session }
    } catch (error) {
      console.error("getCurrentUser error:", error)
      return null
    }
  }

  static async refreshSession(sessionId: string): Promise<Session | null> {
    try {
      return await SessionModel.refresh(sessionId, this.SESSION_DURATION_HOURS)
    } catch (error) {
      console.error("refreshSession error:", error)
      return null
    }
  }

  static setSessionCookie(sessionId: string): void {
    const cookieStore = cookies()
    cookieStore.set(this.SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: this.SESSION_DURATION_HOURS * 60 * 60, // Convert to seconds
      path: "/",
    })
  }

  static clearSessionCookie(): void {
    const cookieStore = cookies()
    cookieStore.delete(this.SESSION_COOKIE_NAME)
  }
}
