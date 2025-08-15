"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Loader2, User, Mail, Phone, Lock, UserCheck, Eye, EyeOff, Shield, Check, X } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

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
          <span className="animate-pulse">Creating your account...</span>
        </>
      ) : (
        <>
          <UserCheck className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
          Create Account
        </>
      )}
    </Button>
  )
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "Contains number", test: (p: string) => /\d/.test(p) },
    { label: "Contains special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ]

  const passedChecks = checks.filter((check) => check.test(password)).length
  const strength = (passedChecks / checks.length) * 100

  const getStrengthColor = () => {
    if (strength < 40) return "bg-red-500"
    if (strength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength < 40) return "Weak"
    if (strength < 70) return "Medium"
    return "Strong"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-glass-text">Password Strength</span>
        <span
          className={`text-xs font-medium ${strength < 40 ? "text-red-400" : strength < 70 ? "text-yellow-400" : "text-green-400"}`}
        >
          {getStrengthText()}
        </span>
      </div>
      <Progress value={strength} className="h-2" />
      <div className="space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            {check.test(password) ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <X className="h-3 w-3 text-red-400" />
            )}
            <span className={check.test(password) ? "text-green-400" : "text-glass-text"}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EnhancedRegisterForm() {
  const [state, formAction] = useActionState(signUp, null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="relative">
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float-delayed"></div>

      <Card className="glass-card w-full max-w-lg mx-auto shadow-2xl hover:shadow-3xl transition-all duration-500 relative z-10">
        <CardHeader className="text-center pb-6 space-y-2">
          <div className="mx-auto w-16 h-16 glass-avatar mb-4">
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">Join CTEK Job Leads</CardTitle>
          <CardDescription className="text-lg text-glass-text">
            Connect with certified ECU remapping professionals
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
                <AlertDescription className="text-green-300 font-medium">{state.success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Label htmlFor="accountType" className="text-sm font-semibold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Account Type
              </Label>
              <Select name="accountType" defaultValue="Customer - Post Jobs">
                <SelectTrigger className="glass-input h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-dropdown">
                  <SelectItem value="Customer - Post Jobs">
                    <div className="flex flex-col py-2">
                      <span className="font-medium text-white">Customer - Post Jobs</span>
                      <span className="text-sm text-glass-text">Find certified dealers for ECU remapping services</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Dealer - Apply for Jobs">
                    <div className="flex flex-col py-2">
                      <span className="font-medium text-white">Dealer - Apply for Jobs</span>
                      <span className="text-sm text-glass-text">
                        Apply for ECU remapping jobs and grow your business
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-sm font-semibold text-white">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  className="glass-input h-12 transition-all duration-300 focus:scale-105"
                  placeholder="John"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-sm font-semibold text-white">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  className="glass-input h-12 transition-all duration-300 focus:scale-105"
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                className="glass-input h-12 transition-all duration-300 focus:scale-105"
                autoComplete="email"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-semibold text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+44 7XXX XXX XXX"
                className="glass-input h-12 transition-all duration-300 focus:scale-105"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a secure password"
                  className="glass-input h-12 pr-12 transition-all duration-300 focus:scale-105"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-glass-text hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                  className="border-glass-border data-[state=checked]:bg-primary mt-1"
                  required
                />
                <Label htmlFor="terms" className="text-sm text-glass-text cursor-pointer leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:text-secondary underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:text-secondary underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="text-center pt-6 border-t border-glass-border space-y-4">
            <p className="text-glass-text">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-primary hover:text-secondary transition-colors duration-300 hover:underline"
              >
                Sign in here
              </Link>
            </p>

            <div className="flex items-center justify-center space-x-2 text-xs text-glass-text/70">
              <Shield className="h-3 w-3" />
              <span>Your information is encrypted and secure</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
