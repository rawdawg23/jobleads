"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, Suspense } from "react"
import { resetPassword } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full btn-secondary py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Updating password...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-5 w-5" />
          Update Password
        </>
      )}
    </Button>
  )
}

function ResetPasswordFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || searchParams.get("access_token")
  const [state, formAction] = useActionState(resetPassword, null)

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        router.push("/auth/login?message=password-reset-success")
      }, 2000)
    }
  }, [state, router])

  if (!token && !searchParams.get("type")) {
    return (
      <Card className="w-full shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-foreground mb-2">Invalid Reset Link</CardTitle>
          <CardDescription className="text-lg text-foreground/70">
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive" className="border-red-200/50 bg-red-50/80 backdrop-blur-sm">
            <AlertDescription className="text-red-800">Please request a new password reset link.</AlertDescription>
          </Alert>

          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:text-secondary transition-colors duration-300"
            >
              Request New Reset Link
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state?.success) {
    return (
      <Card className="w-full shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-foreground mb-2">Password Updated!</CardTitle>
          <CardDescription className="text-lg text-foreground/70">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-green-200/50 bg-green-50/80 backdrop-blur-sm">
            <AlertDescription className="text-green-800">
              You can now sign in with your new password. Redirecting to sign in page...
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Link href="/auth/login" className="text-primary hover:text-secondary transition-colors duration-300">
              Sign In Now
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-foreground mb-2">Reset Password</CardTitle>
        <CardDescription className="text-lg text-foreground/70">Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <Alert variant="destructive" className="border-red-200/50 bg-red-50/80 backdrop-blur-sm">
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your new password"
              required
              minLength={8}
              className="h-12 bg-white/60 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              required
              minLength={8}
              className="h-12 bg-white/60 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="text-center pt-4 border-t border-white/20">
          <Link href="/auth/login" className="text-foreground/70 hover:text-foreground transition-colors duration-300">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <Card className="w-full shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-white/20 rounded"></div>
                <div className="h-10 bg-white/20 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  )
}
