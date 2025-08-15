"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Mail, Phone, Lock, UserCheck } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creating your account...
        </>
      ) : (
        <>
          <UserCheck className="mr-2 h-5 w-5" />
          Create Account
        </>
      )}
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Create Account</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Join the CTEK JOB LEADS platform and connect with certified professionals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{state.success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="accountType" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Account Type
            </Label>
            <Select name="accountType" defaultValue="Customer - Post Jobs">
              <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer - Post Jobs">
                  <div className="flex flex-col">
                    <span className="font-medium">Customer - Post Jobs</span>
                    <span className="text-sm text-gray-500">Find certified dealers for ECU remapping</span>
                  </div>
                </SelectItem>
                <SelectItem value="Dealer - Apply for Jobs">
                  <div className="flex flex-col">
                    <span className="font-medium">Dealer - Apply for Jobs</span>
                    <span className="text-sm text-gray-500">Apply for ECU remapping jobs</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                required
                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                required
                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your last name"
              />
            </div>
          </div>

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

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Your contact number"
              className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Create a secure password"
              className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
