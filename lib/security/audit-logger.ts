import { createClient } from "@/lib/supabase/server"

export interface AuditLogEntry {
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  success: boolean
  error_message?: string
}

export class AuditLogger {
  private static instance: AuditLogger
  private logs: AuditLogEntry[] = []

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  async log(entry: AuditLogEntry): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      metadata: {
        timestamp: new Date().toISOString(),
        ...entry.metadata,
      },
    }

    // Store in memory for immediate access
    this.logs.push(logEntry)

    // Keep only last 1000 entries in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("🔒 Security Audit:", logEntry)
    }

    // In production, you would typically send this to a logging service
    // or store in a dedicated audit table
    try {
      const supabase = createClient()
      // Note: You would need to create an audit_logs table for this
      // await supabase.from('audit_logs').insert(logEntry)
    } catch (error) {
      console.error("Failed to store audit log:", error)
    }
  }

  getRecentLogs(limit = 100): AuditLogEntry[] {
    return this.logs.slice(-limit)
  }

  getLogsByUser(userId: string, limit = 50): AuditLogEntry[] {
    return this.logs.filter((log) => log.user_id === userId).slice(-limit)
  }

  getFailedAttempts(action: string, timeWindowMs: number = 60 * 60 * 1000): AuditLogEntry[] {
    const cutoff = Date.now() - timeWindowMs
    return this.logs.filter(
      (log) =>
        log.action === action &&
        !log.success &&
        log.metadata?.timestamp &&
        new Date(log.metadata.timestamp).getTime() > cutoff,
    )
  }
}

// Convenience functions for common audit events
export const auditLogger = AuditLogger.getInstance()

export async function logAuthAttempt(
  action: "login" | "register" | "logout",
  success: boolean,
  userId?: string,
  error?: string,
  metadata?: Record<string, any>,
) {
  await auditLogger.log({
    user_id: userId,
    action,
    resource_type: "authentication",
    success,
    error_message: error,
    metadata,
  })
}

export async function logDataAccess(
  action: "read" | "create" | "update" | "delete",
  resourceType: string,
  resourceId: string,
  userId?: string,
  success = true,
  error?: string,
) {
  await auditLogger.log({
    user_id: userId,
    action: `${action}_${resourceType}`,
    resource_type: resourceType,
    resource_id: resourceId,
    success,
    error_message: error,
  })
}
