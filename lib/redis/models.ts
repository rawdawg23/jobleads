import { redisClient, isRedisConfigured } from "./client"
import { nanoid } from "nanoid"
import { WebCrypto } from "./crypto"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: "customer" | "dealer" | "admin"
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
}

export interface UserCredentials {
  userId: string
  passwordHash: string
  version?: string
  previousVersion?: string
  lastUpdated?: string
}

export interface PasswordResetToken {
  id: string
  userId: string
  email: string
  expiresAt: string
  createdAt: string
  used: boolean
}

export const RedisKeys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `email:${email}`,
  userCredentials: (userId: string) => `credentials:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  userSessions: (userId: string) => `user_sessions:${userId}`,
  passwordResetToken: (tokenId: string) => `reset_token:${tokenId}`,
}

export class UserModel {
  static async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">, password: string): Promise<User> {
    if (!isRedisConfigured) {
      return {
        id: nanoid(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    const userId = nanoid()
    const now = new Date().toISOString()

    const user: User = {
      id: userId,
      ...userData,
      createdAt: now,
      updatedAt: now,
    }

    try {
      const passwordHash = await WebCrypto.hash(password, 12)

      // Store user data
      await redisClient.set(RedisKeys.user(userId), JSON.stringify(user))

      // Create email-to-userId mapping
      await redisClient.set(RedisKeys.userByEmail(userData.email), userId)

      // Store credentials
      await redisClient.set(
        RedisKeys.userCredentials(userId),
        JSON.stringify({
          userId,
          passwordHash,
          version: "current",
        }),
      )

      return user
    } catch (error) {
      console.error("UserModel.create error:", error instanceof Error ? error.message : String(error))
      throw new Error("Failed to create user")
    }
  }

  static async findById(id: string): Promise<User | null> {
    if (!isRedisConfigured) return null

    try {
      console.log("[v0] UserModel.findById - Looking for user:", id)
      const userData = await redisClient.get(RedisKeys.user(id))
      console.log("[v0] UserModel.findById - Raw userData:", userData, typeof userData)

      if (!userData) {
        console.log("[v0] UserModel.findById - No user data found")
        return null
      }

      let parsedUser: User

      if (typeof userData === "string") {
        // Redis returned a JSON string, parse it
        try {
          parsedUser = JSON.parse(userData)
          console.log("[v0] UserModel.findById - Parsed user from string:", parsedUser)
        } catch (parseError) {
          console.error(
            "UserModel.findById - JSON parse error:",
            parseError instanceof Error ? parseError.message : String(parseError),
          )
          console.error("UserModel.findById - Raw data that failed to parse:", userData)
          return null
        }
      } else if (typeof userData === "object" && userData !== null) {
        // Redis returned an already-parsed object, use it directly
        parsedUser = userData as User
        console.log("[v0] UserModel.findById - Using parsed object directly:", parsedUser)
      } else {
        console.error("UserModel.findById - Invalid data type:", typeof userData, userData)
        return null
      }

      return parsedUser
    } catch (error) {
      console.error("UserModel.findById error:", error instanceof Error ? error.message : String(error))
      return null
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    if (!isRedisConfigured) return null

    try {
      console.log("[v0] UserModel.findByEmail - Looking for email:", email)
      const userId = await redisClient.get(RedisKeys.userByEmail(email))
      console.log("[v0] UserModel.findByEmail - Found userId:", userId)

      if (!userId) return null

      let userIdString: string
      if (typeof userId === "string") {
        userIdString = userId
      } else if (typeof userId === "object" && userId !== null) {
        // If Redis returns an object, try to extract the string value
        userIdString = String(userId)
      } else {
        console.error("UserModel.findByEmail - Invalid userId type:", typeof userId, userId)
        return null
      }

      return this.findById(userIdString)
    } catch (error) {
      console.error("UserModel.findByEmail error:", error instanceof Error ? error.message : String(error))
      return null
    }
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    if (!isRedisConfigured) return null

    try {
      console.log("[v0] UserModel.verifyPassword - Verifying for email:", email)
      const user = await this.findByEmail(email)
      if (!user) {
        console.log("[v0] UserModel.verifyPassword - User not found")
        return null
      }

      console.log("[v0] UserModel.verifyPassword - User found, checking credentials")
      const credentialsData = await redisClient.get(RedisKeys.userCredentials(user.id))
      console.log("[v0] UserModel.verifyPassword - Credentials data:", credentialsData, typeof credentialsData)

      if (!credentialsData) {
        console.log("[v0] UserModel.verifyPassword - No credentials found")
        return null
      }

      let credentials: UserCredentials

      if (typeof credentialsData === "string") {
        try {
          credentials = JSON.parse(credentialsData)
          console.log("[v0] UserModel.verifyPassword - Parsed credentials from string")
        } catch (parseError) {
          console.error(
            "UserModel.verifyPassword - JSON parse error:",
            parseError instanceof Error ? parseError.message : String(parseError),
          )
          console.error("UserModel.verifyPassword - Raw credentials data that failed to parse:", credentialsData)
          return null
        }
      } else if (typeof credentialsData === "object" && credentialsData !== null) {
        credentials = credentialsData as UserCredentials
      } else {
        console.error(
          "UserModel.verifyPassword - Invalid credentials data type:",
          typeof credentialsData,
          credentialsData,
        )
        return null
      }

      let isValid = false

      // Try current version first
      console.log("[v0] UserModel.verifyPassword - Trying current WebCrypto method")
      isValid = await WebCrypto.compare(password, credentials.passwordHash)

      if (!isValid && credentials.version) {
        console.log("[v0] UserModel.verifyPassword - Current method failed, trying version-specific comparison")
        isValid = await WebCrypto.compareVersioned(password, credentials.passwordHash, credentials.version)
      }

      // If still not valid and there's a previous version, try legacy methods
      if (!isValid && credentials.previousVersion === "legacy") {
        console.log("[v0] UserModel.verifyPassword - Trying legacy password comparison")
        isValid = await WebCrypto.compareLegacy(password, credentials.passwordHash)
      }

      console.log("[v0] UserModel.verifyPassword - Password valid:", isValid)

      if (isValid && credentials.version !== "current") {
        console.log("[v0] UserModel.verifyPassword - Updating password hash to current version")
        try {
          const newPasswordHash = await WebCrypto.hash(password, 12)
          const updatedCredentials = {
            ...credentials,
            passwordHash: newPasswordHash,
            version: "current",
            previousVersion: credentials.version || "legacy",
            lastUpdated: new Date().toISOString(),
          }
          await redisClient.set(RedisKeys.userCredentials(user.id), JSON.stringify(updatedCredentials))
          console.log("[v0] UserModel.verifyPassword - Password hash updated successfully")
        } catch (updateError) {
          console.error("Failed to update password hash:", updateError)
          // Don't fail login if hash update fails
        }
      }

      return isValid ? user : null
    } catch (error) {
      console.error("UserModel.verifyPassword error:", error instanceof Error ? error.message : String(error))
      return null
    }
  }

  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    if (!isRedisConfigured) return false

    try {
      const passwordHash = await WebCrypto.hash(newPassword, 12)
      const credentials: UserCredentials = {
        userId,
        passwordHash,
        version: "current",
        lastUpdated: new Date().toISOString(),
      }

      await redisClient.set(RedisKeys.userCredentials(userId), JSON.stringify(credentials))
      return true
    } catch (error) {
      console.error("UserModel.updatePassword error:", error instanceof Error ? error.message : String(error))
      return false
    }
  }

  static async update(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
    if (!isRedisConfigured) return null

    const user = await this.findById(id)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await redisClient.set(RedisKeys.user(id), JSON.stringify(updatedUser))
    return updatedUser
  }
}

export class PasswordResetModel {
  static async create(userId: string, email: string, expiresInHours = 1): Promise<PasswordResetToken> {
    const tokenId = nanoid()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000)

    const token: PasswordResetToken = {
      id: tokenId,
      userId,
      email,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
      used: false,
    }

    if (!isRedisConfigured) return token

    try {
      // Store token with TTL
      const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      await redisClient.setex(RedisKeys.passwordResetToken(tokenId), ttlSeconds, JSON.stringify(token))

      return token
    } catch (error) {
      console.error("PasswordResetModel.create error:", error instanceof Error ? error.message : String(error))
      throw new Error("Failed to create password reset token")
    }
  }

  static async findById(tokenId: string): Promise<PasswordResetToken | null> {
    if (!isRedisConfigured) return null

    try {
      const tokenData = await redisClient.get(RedisKeys.passwordResetToken(tokenId))
      if (!tokenData) return null

      let token: PasswordResetToken

      if (typeof tokenData === "string") {
        try {
          token = JSON.parse(tokenData)
        } catch (parseError) {
          console.error(
            "PasswordResetModel.findById - JSON parse error:",
            parseError instanceof Error ? parseError.message : String(parseError),
          )
          return null
        }
      } else if (typeof tokenData === "object" && tokenData !== null) {
        token = tokenData as PasswordResetToken
      } else {
        console.error("PasswordResetModel.findById - Invalid token data type:", typeof tokenData, tokenData)
        return null
      }

      // Check if token is expired
      if (new Date(token.expiresAt) < new Date()) {
        await this.delete(tokenId)
        return null
      }

      // Check if token is already used
      if (token.used) {
        return null
      }

      return token
    } catch (error) {
      console.error("PasswordResetModel.findById error:", error instanceof Error ? error.message : String(error))
      return null
    }
  }

  static async markAsUsed(tokenId: string): Promise<boolean> {
    if (!isRedisConfigured) return false

    try {
      const token = await this.findById(tokenId)
      if (!token) return false

      const updatedToken = {
        ...token,
        used: true,
      }

      // Update token with remaining TTL
      const ttl = await redisClient.ttl(RedisKeys.passwordResetToken(tokenId))
      if (ttl > 0) {
        await redisClient.setex(RedisKeys.passwordResetToken(tokenId), ttl, JSON.stringify(updatedToken))
      }

      return true
    } catch (error) {
      console.error("PasswordResetModel.markAsUsed error:", error instanceof Error ? error.message : String(error))
      return false
    }
  }

  static async delete(tokenId: string): Promise<void> {
    if (!isRedisConfigured) return

    try {
      await redisClient.del(RedisKeys.passwordResetToken(tokenId))
    } catch (error) {
      console.error("PasswordResetModel.delete error:", error instanceof Error ? error.message : String(error))
    }
  }
}

export class SessionModel {
  static async create(userId: string, expiresInHours = 24): Promise<Session> {
    const sessionId = nanoid()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000)

    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
    }

    if (!isRedisConfigured) return session

    try {
      // Store session with TTL
      const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      await redisClient.setex(RedisKeys.session(sessionId), ttlSeconds, JSON.stringify(session))

      // Add to user's session list
      await redisClient.sadd(RedisKeys.userSessions(userId), sessionId)

      return session
    } catch (error) {
      console.error("SessionModel.create error:", error instanceof Error ? error.message : String(error))
      throw new Error("Failed to create session")
    }
  }

  static async findById(sessionId: string): Promise<Session | null> {
    if (!isRedisConfigured) return null

    try {
      const sessionData = await redisClient.get(RedisKeys.session(sessionId))
      if (!sessionData) return null

      let session: Session

      if (typeof sessionData === "string") {
        try {
          session = JSON.parse(sessionData)
        } catch (parseError) {
          console.error(
            "SessionModel.findById - JSON parse error:",
            parseError instanceof Error ? parseError.message : String(parseError),
          )
          console.error("SessionModel.findById - Raw session data that failed to parse:", sessionData)
          return null
        }
      } else if (typeof sessionData === "object" && sessionData !== null) {
        session = sessionData as Session
      } else {
        console.error("SessionModel.findById - Invalid session data type:", typeof sessionData, sessionData)
        return null
      }

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await this.delete(sessionId)
        return null
      }

      return session
    } catch (error) {
      console.error("SessionModel.findById error:", error instanceof Error ? error.message : String(error))
      return null
    }
  }

  static async delete(sessionId: string): Promise<void> {
    if (!isRedisConfigured) return

    const session = await this.findById(sessionId)
    if (session) {
      await redisClient.srem(RedisKeys.userSessions(session.userId), sessionId)
    }
    await redisClient.del(RedisKeys.session(sessionId))
  }

  static async deleteAllUserSessions(userId: string): Promise<void> {
    if (!isRedisConfigured) return

    const sessionIds = await redisClient.smembers(RedisKeys.userSessions(userId))

    if (sessionIds.length > 0) {
      // Delete all sessions
      const sessionKeys = sessionIds.map((id) => RedisKeys.session(id as string))
      await redisClient.del(...sessionKeys)

      // Clear user's session list
      await redisClient.del(RedisKeys.userSessions(userId))
    }
  }

  static async refresh(sessionId: string, expiresInHours = 24): Promise<Session | null> {
    if (!isRedisConfigured) return null

    const session = await this.findById(sessionId)
    if (!session) return null

    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000)

    const updatedSession = {
      ...session,
      expiresAt: expiresAt.toISOString(),
    }

    const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    await redisClient.setex(RedisKeys.session(sessionId), ttlSeconds, JSON.stringify(updatedSession))

    return updatedSession
  }
}
