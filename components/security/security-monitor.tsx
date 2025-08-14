"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface SecurityStatus {
  sessionValid: boolean
  lastActivity: Date
  securityScore: number
  warnings: string[]
}

export function SecurityMonitor() {
  const { user } = useAuth()
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    sessionValid: true,
    lastActivity: new Date(),
    securityScore: 100,
    warnings: [],
  })

  useEffect(() => {
    if (!user) return

    const checkSecurityStatus = () => {
      const warnings: string[] = []
      let score = 100

      // Check session age
      const sessionAge = Date.now() - new Date(user.created_at).getTime()
      const maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours

      if (sessionAge > maxSessionAge) {
        warnings.push("Long session detected - consider re-authenticating")
        score -= 20
      }

      // Check for suspicious activity patterns
      const lastActivity = new Date()
      const timeSinceLastActivity = Date.now() - lastActivity.getTime()

      if (timeSinceLastActivity > 30 * 60 * 1000) {
        // 30 minutes of inactivity
        warnings.push("Extended inactivity detected")
        score -= 10
      }

      setSecurityStatus({
        sessionValid: true,
        lastActivity,
        securityScore: Math.max(0, score),
        warnings,
      })
    }

    checkSecurityStatus()
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [user])

  if (!user) return null

  const getSecurityIcon = () => {
    if (securityStatus.securityScore >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (securityStatus.securityScore >= 60) return <Shield className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const getSecurityColor = () => {
    if (securityStatus.securityScore >= 80) return "text-green-600"
    if (securityStatus.securityScore >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm">
      <div className="flex items-center space-x-2 mb-2">
        {getSecurityIcon()}
        <span className={`text-sm font-medium ${getSecurityColor()}`}>
          Security Score: {securityStatus.securityScore}%
        </span>
      </div>

      {securityStatus.warnings.length > 0 && (
        <div className="space-y-1">
          {securityStatus.warnings.map((warning, index) => (
            <p key={index} className="text-xs text-gray-600 flex items-start space-x-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
