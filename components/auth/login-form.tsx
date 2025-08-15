"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, LogIn } from "lucide-react"
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
      className="w-full btn-primary py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Signing you in...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-5 w-5" />
          Sign In
        </>
      )}
    </Button>
  )
}

export function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state, router])

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-foreground mb-2">Welcome Back</CardTitle>
        <CardDescription className="text-lg text-foreground/70">
          Sign in to access your CTEK JOB LEADS account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <Alert variant="destructive" className="border-red-200/50 bg-red-50/80 backdrop-blur-sm">
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-12 bg-white/60 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:text-secondary transition-colors duration-300"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="h-12 bg-white/60 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-foreground/70">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-primary hover:text-secondary transition-colors duration-300"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
