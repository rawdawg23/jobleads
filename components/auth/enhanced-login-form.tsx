"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full glass-button-primary py-4 text-lg font-medium transition-all duration-300 hover:scale-105 group"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="animate-pulse">Authenticating...</span>
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          Sign In Securely
        </>
      )}
    </Button>
  )
}

export function EnhancedLoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setIsLoading(true)
      // Add a small delay for better UX
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    }
  }, [state, router])

  return (
    <div className="relative">
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float-delayed"></div>

      <Card className="glass-card w-full max-w-md mx-auto shadow-2xl hover:shadow-3xl transition-all duration-500 relative z-10">
        <CardHeader className="text-center pb-6 space-y-2">
          <div className="mx-auto w-16 h-16 glass-avatar mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">Welcome Back</CardTitle>
          <CardDescription className="text-lg text-glass-text">
            Sign in to access your CTEK JOB LEADS account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <Alert className="glass-alert-error animate-shake">
                <AlertDescription className="text-red-300 font-medium">{state.error}</AlertDescription>
              </Alert>
            )}

            {state?.success && (
              <Alert className="glass-alert-success">
                <AlertDescription className="text-green-300 font-medium">
                  Login successful! Redirecting to your dashboard...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Label htmlFor="email" className="text-sm font-semibold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="glass-input h-12 transition-all duration-300 focus:scale-105"
                autoComplete="email"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:text-secondary transition-colors duration-300 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="glass-input h-12 pr-12 transition-all duration-300 focus:scale-105"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-glass-text hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                className="border-glass-border data-[state=checked]:bg-primary"
              />
              <Label htmlFor="remember" className="text-sm text-glass-text cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <SubmitButton />
          </form>

          <div className="text-center pt-6 border-t border-glass-border">
            <p className="text-glass-text mb-4">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-primary hover:text-secondary transition-colors duration-300 hover:underline"
              >
                Sign up here
              </Link>
            </p>

            <div className="flex items-center justify-center space-x-2 text-xs text-glass-text/70">
              <Shield className="h-3 w-3" />
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-white font-medium">Preparing your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  )
}
