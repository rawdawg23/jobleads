"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, RefreshCw, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EmailVerificationPromptProps {
  email: string
  onVerified?: () => void
}

export function EmailVerificationPrompt({ email, onVerified }: EmailVerificationPromptProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleResendEmail = async () => {
    setIsResending(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (err) {
      setError("Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float"></div>

      <Card className="glass-card w-full max-w-md mx-auto shadow-2xl relative z-10">
        <CardHeader className="text-center pb-6 space-y-4">
          <div className="mx-auto w-16 h-16 glass-avatar">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
          <CardDescription className="text-glass-text">
            We've sent a verification link to <span className="text-white font-medium">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="glass-alert-error">
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert className="glass-alert-success">
              <AlertDescription className="text-green-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verification email sent successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <p className="text-glass-text text-sm">
              Click the link in your email to verify your account and start using CTEK Job Leads.
            </p>

            <div className="pt-4">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="glass-button-secondary bg-transparent"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Email
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-glass-border">
            <p className="text-xs text-glass-text/70">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
