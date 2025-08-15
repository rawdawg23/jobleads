"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { requestPasswordReset } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Sending reset link...
        </>
      ) : (
        <>
          <Send className="mr-2 h-5 w-5" />
          Send Reset Link
        </>
      )}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, null)

  if (state?.success) {
    return (
      <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            We've sent a password reset link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              If an account with that email exists, you'll receive a password reset link shortly.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="text-center pt-4 border-t border-gray-200">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
