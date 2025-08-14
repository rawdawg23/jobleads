interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      return false
    }

    if (now > entry.resetTime) {
      this.attempts.delete(identifier)
      return false
    }

    return entry.count >= this.maxAttempts
  }

  recordAttempt(identifier: string): {
    isLimited: boolean
    remainingAttempts: number
    resetTime: number
  } {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry || now > entry.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return {
        isLimited: false,
        remainingAttempts: this.maxAttempts - 1,
        resetTime: now + this.windowMs,
      }
    }

    entry.count += 1
    const isLimited = entry.count >= this.maxAttempts

    return {
      isLimited,
      remainingAttempts: Math.max(0, this.maxAttempts - entry.count),
      resetTime: entry.resetTime,
    }
  }

  getRemainingTime(identifier: string): number {
    const entry = this.attempts.get(identifier)
    if (!entry) return 0

    const now = Date.now()
    return Math.max(0, entry.resetTime - now)
  }
}

// Global rate limiters for different actions
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const registrationRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour
