"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/simple-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await login(email, password)

      if (!result.success) {
        setError(result.error || "Invalid email or password")
      } else {
        router.push("/profile")
      }
    } catch (error) {
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-foreground mb-2">Welcome Back</CardTitle>
        <CardDescription className="text-lg text-foreground/70">
          Sign in to access your CTEK JOB LEADS account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200/50 bg-red-50/80 backdrop-blur-sm">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            {isLoading ? (
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
