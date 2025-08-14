import { redisClient } from "./client"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"

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
    const userId = nanoid()
    const now = new Date().toISOString()

    const user: User = {
      id: userId,
      ...userData,
      createdAt: now,
      updatedAt: now,
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

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
    const userData = await redisClient.get(RedisKeys.user(id))
    return userData ? JSON.parse(userData as string) : null
  }

  static async findByEmail(email: string): Promise<User | null> {
    const userId = await redisClient.get(RedisKeys.userByEmail(email))
    if (!userId) return null

    return this.findById(userId as string)
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user) return null

    const credentialsData = await redisClient.get(RedisKeys.userCredentials(user.id))
    if (!credentialsData) return null

    const credentials: UserCredentials = JSON.parse(credentialsData as string)
    const isValid = await bcrypt.compare(password, credentials.passwordHash)

    return isValid ? user : null
  }

  static async update(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
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

    // Store session with TTL
    const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    await redisClient.setex(RedisKeys.session(sessionId), ttlSeconds, JSON.stringify(session))

    // Add to user's session list
    await redisClient.sadd(RedisKeys.userSessions(userId), sessionId)

    return session
  }

  static async findById(sessionId: string): Promise<Session | null> {
    const sessionData = await redisClient.get(RedisKeys.session(sessionId))
    if (!sessionData) return null

    const session: Session = JSON.parse(sessionData as string)

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await this.delete(sessionId)
      return null
    }

    return session
  }

  static async delete(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId)
    if (session) {
      await redisClient.srem(RedisKeys.userSessions(session.userId), sessionId)
    }
    await redisClient.del(RedisKeys.session(sessionId))
  }

  static async deleteAllUserSessions(userId: string): Promise<void> {
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
