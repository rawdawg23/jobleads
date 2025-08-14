"use client"

import { validatePasswordStrength } from "@/lib/security/validation"
import { useEffect, useState } from "react"

interface PasswordStrengthIndicatorProps {
  password: string
  showFeedback?: boolean
}

export function PasswordStrengthIndicator({ password, showFeedback = true }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState({ score: 0, feedback: [], isValid: false })

  useEffect(() => {
    if (password) {
      setStrength(validatePasswordStrength(password))
    } else {
      setStrength({ score: 0, feedback: [], isValid: false })
    }
  }, [password])

  if (!password) return null

  const getStrengthColor = (score: number) => {
    if (score <= 2) return "bg-red-500"
    if (score <= 4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (score: number) => {
    if (score <= 2) return "Weak"
    if (score <= 4) return "Medium"
    return "Strong"
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
            style={{ width: `${(strength.score / 6) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${strength.isValid ? "text-green-600" : "text-gray-600"}`}>
          {getStrengthText(strength.score)}
        </span>
      </div>

      {showFeedback && strength.feedback.length > 0 && (
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">To strengthen your password:</p>
          <ul className="list-disc list-inside space-y-1">
            {strength.feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
