export function validateEnvironment() {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName] || process.env[varName]!.length === 0)

  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(", ")}`)
    console.warn("Application will run with limited functionality")
  }

  const optionalVars = ["RESEND_API_KEY", "DVLA_API_KEY"]

  const missingOptional = optionalVars.filter((varName) => !process.env[varName] || process.env[varName]!.length === 0)

  if (missingOptional.length > 0) {
    console.info(`Optional environment variables not set: ${missingOptional.join(", ")}`)
  }

  return {
    hasRequiredVars: missingVars.length === 0,
    missingRequired: missingVars,
    missingOptional,
  }
}

export const envConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || "re_123456789",
    configured: !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_123456789"),
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    nodeEnv: process.env.NODE_ENV || "development",
  },
}
