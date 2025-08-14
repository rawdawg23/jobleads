import { z } from "zod"

// Email validation schema
export const emailSchema = z.string().email("Please enter a valid email address")

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

// Phone validation schema
export const phoneSchema = z
  .string()
  .regex(/^(\+44|0)[1-9]\d{8,9}$/, "Please enter a valid UK phone number")
  .optional()

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")

// Registration validation schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  accountType: z.enum(["Customer - Post Jobs", "Dealer - Apply for Jobs"]),
})

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
  isValid: boolean
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push("Use at least 8 characters")

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("Add uppercase letters")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("Add lowercase letters")

  if (/[0-9]/.test(password)) score += 1
  else feedback.push("Add numbers")

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push("Add special characters")

  if (password.length >= 12) score += 1

  return {
    score,
    feedback,
    isValid: score >= 4,
  }
}
