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
}

export const RedisKeys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `email:${email}`,
  userCredentials: (userId: string) => `credentials:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  userSessions: (userId: string) => `user_sessions:${userId}`,
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
      }),
    )

    return user
  }

  static async findById(id: string): Promise<User | null> {
    if (!isRedisConfigured) return null

    try {
      const userData = await redisClient.get(RedisKeys.user(id))
      if (!userData) return null

      // Ensure userData is a string before parsing
      if (typeof userData !== 'string') {
        console.error("Invalid user data type:", typeof userData)
        return null
      }

      return JSON.parse(userData)
    } catch (error) {
      console.error("Error finding user by ID:", error)
      return null
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    if (!isRedisConfigured) return null

    try {
      const userId = await redisClient.get(RedisKeys.userByEmail(email))
      if (!userId) return null

      // Ensure userId is a string
      if (typeof userId !== 'string') {
        console.error("Invalid userId type:", typeof userId)
        return null
      }

      return this.findById(userId)
    } catch (error) {
      console.error("Error finding user by email:", error)
      return null
    }
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    if (!isRedisConfigured) {
      console.warn("Redis is not configured, cannot verify password")
      return null
    }

    try {
      const user = await this.findByEmail(email)
      if (!user) return null

      const credentialsData = await redisClient.get(RedisKeys.userCredentials(user.id))
      if (!credentialsData) return null

      // Ensure credentialsData is a string before parsing
      if (typeof credentialsData !== 'string') {
        console.error("Invalid credentials data type:", typeof credentialsData)
        return null
      }

      const credentials: UserCredentials = JSON.parse(credentialsData)
      const isValid = await WebCrypto.compare(password, credentials.passwordHash)

      return isValid ? user : null
    } catch (error) {
      console.error("Error verifying password:", error)
      return null
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

    // Store session with TTL
    const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    await redisClient.setex(RedisKeys.session(sessionId), ttlSeconds, JSON.stringify(session))

    // Add to user's session list
    await redisClient.sadd(RedisKeys.userSessions(userId), sessionId)

    return session
  }

  static async findById(sessionId: string): Promise<Session | null> {
    if (!isRedisConfigured) return null

    try {
      const sessionData = await redisClient.get(RedisKeys.session(sessionId))
      if (!sessionData) return null

      // Ensure sessionData is a string before parsing
      if (typeof sessionData !== 'string') {
        console.error("Invalid session data type:", typeof sessionData)
        return null
      }

      const session: Session = JSON.parse(sessionData)

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await this.delete(sessionId)
        return null
      }

      return session
    } catch (error) {
      console.error("Error finding session by ID:", error)
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
