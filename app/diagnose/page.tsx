"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DiagnosisData {
  status: string
  diagnosis: {
    timestamp: string
    session: {
      exists: boolean
      userId: string | null
      email: string | null
      error: string | null
    }
    user: {
      exists: boolean
      userId: string | null
      email: string | null
      error: string | null
    }
    database: {
      status: string
      userCount: number
    }
    environment: Record<string, any>
    globalAuthState: {
      note: string
    }
  }
  recommendations: string[]
}

export default function DiagnosePage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const runDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/diagnose")
      const data = await response.json()
      setDiagnosis(data)
      console.log("[v0] Diagnosis results:", data)
    } catch (error) {
      console.error("[v0] Diagnosis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const runAction = async (action: string) => {
    setActionLoading(action)
    try {
      if (action === "create-admin-user") {
        const response = await fetch("/api/create-admin", {
          method: "POST",
        })
        const data = await response.json()
        console.log(`[v0] Action ${action} result:`, data)
        alert(`${action}: ${data.message || data.error}`)
        // Refresh diagnosis after creating admin user
        if (data.success) {
          await runDiagnosis()
        }
      } else if (action === "check-auth-trigger") {
        const response = await fetch("/api/fix-auth-trigger")
        const data = await response.json()
        console.log(`[v0] Trigger check result:`, data)

        if (data.status === "broken") {
          const message = `Auth Trigger Issues Found:\n\n${data.message}\n\nFix Instructions:\n${data.fixInstructions.join("\n")}\n\nSQL Fix:\n${data.sqlFix}`
          alert(message)
        } else if (data.status === "fixed") {
          alert(`Auth trigger is working correctly: ${data.message}`)
        } else {
          alert(`Error checking trigger: ${data.message}`)
        }
      } else if (action === "fix-auth-trigger") {
        const confirmed = confirm(
          "⚠️ CRITICAL FIX REQUIRED ⚠️\n\n" +
            "This will provide SQL commands to fix the broken auth trigger causing 'Database error saving new user'.\n\n" +
            "You'll need to run the provided SQL in your Supabase SQL Editor.\n\n" +
            "Continue?",
        )

        if (confirmed) {
          const sqlFix = `-- CRITICAL FIX: Auth Trigger Column Mismatch
-- Run this in Supabase SQL Editor to fix "Database error saving new user"

-- Drop the existing broken trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the corrected trigger function with proper column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the fix
SELECT 'Auth trigger fixed successfully!' as status;`

          // Copy to clipboard
          navigator.clipboard
            .writeText(sqlFix)
            .then(() => {
              alert(
                "🚨 CRITICAL AUTH TRIGGER FIX 🚨\n\n" +
                  "SQL fix has been copied to your clipboard!\n\n" +
                  "STEPS TO FIX:\n" +
                  "1. Go to your Supabase Dashboard\n" +
                  "2. Open SQL Editor\n" +
                  "3. Paste and run the copied SQL\n" +
                  "4. Test user registration\n\n" +
                  "This fixes the column mismatch causing 'Database error saving new user'",
              )
            })
            .catch(() => {
              alert(
                "🚨 CRITICAL AUTH TRIGGER FIX 🚨\n\n" +
                  sqlFix +
                  "\n\n" +
                  "Copy this SQL and run it in your Supabase SQL Editor to fix the auth trigger.",
              )
            })
        }
      } else {
        const response = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        })
        const data = await response.json()
        console.log(`[v0] Action ${action} result:`, data)
        alert(`${action}: ${data.message}`)
      }
    } catch (error) {
      console.error(`[v0] Action ${action} failed:`, error)
      alert(`${action} failed: ${error}`)
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    runDiagnosis()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">System Diagnosis</h1>
          <p className="text-slate-600">Comprehensive authentication and system health check</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Test and fix common issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={runDiagnosis} disabled={loading} variant="default">
                {loading ? "Running..." : "Run Diagnosis"}
              </Button>
              <Button
                onClick={() => runAction("reset-auth")}
                disabled={actionLoading === "reset-auth"}
                variant="outline"
              >
                {actionLoading === "reset-auth" ? "Resetting..." : "Reset Auth System"}
              </Button>
              <Button
                onClick={() => runAction("create-admin-user")}
                disabled={actionLoading === "create-admin-user"}
                variant="outline"
              >
                {actionLoading === "create-admin-user" ? "Creating..." : "Create Admin User"}
              </Button>
              <Button
                onClick={() => runAction("fix-auth-trigger")}
                disabled={actionLoading === "fix-auth-trigger"}
                variant="destructive"
              >
                {actionLoading === "fix-auth-trigger" ? "Fixing..." : "🚨 Fix Auth Trigger"}
              </Button>
              <Button
                onClick={() => runAction("test-forgot-password")}
                disabled={actionLoading === "test-forgot-password"}
                variant="outline"
              >
                {actionLoading === "test-forgot-password" ? "Testing..." : "Test Forgot Password"}
              </Button>
              <Button
                onClick={() => runAction("check-auth-trigger")}
                disabled={actionLoading === "check-auth-trigger"}
                variant="outline"
              >
                {actionLoading === "check-auth-trigger" ? "Checking..." : "Check Auth Trigger"}
              </Button>
              <Button onClick={() => window.location.reload()} variant="secondary">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {diagnosis && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Authentication Status</CardTitle>
                <CardDescription>Current user session and authentication state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Session</h4>
                    <Badge variant={diagnosis.diagnosis.session.exists ? "default" : "destructive"}>
                      {diagnosis.diagnosis.session.exists ? "Active" : "None"}
                    </Badge>
                    {diagnosis.diagnosis.session.email && (
                      <p className="text-sm text-slate-600 mt-1">Email: {diagnosis.diagnosis.session.email}</p>
                    )}
                    {diagnosis.diagnosis.session.error && (
                      <p className="text-sm text-red-600 mt-1">Error: {diagnosis.diagnosis.session.error}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">User</h4>
                    <Badge variant={diagnosis.diagnosis.user.exists ? "default" : "destructive"}>
                      {diagnosis.diagnosis.user.exists ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                    {diagnosis.diagnosis.user.error && (
                      <p className="text-sm text-red-600 mt-1">Error: {diagnosis.diagnosis.user.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>Database connection and user data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={diagnosis.diagnosis.database.status === "connected" ? "default" : "destructive"}>
                      {diagnosis.diagnosis.database.status}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      Users in database: {diagnosis.diagnosis.database.userCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment Configuration</CardTitle>
                <CardDescription>Required environment variables and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(diagnosis.diagnosis.environment).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-mono">{key}</span>
                      <Badge variant={value ? "default" : "destructive"}>
                        {typeof value === "boolean" ? (value ? "Set" : "Missing") : String(value) || "Empty"}
                      </Badge>
                    </div>
                  ))}
                </div>
                {!diagnosis.diagnosis.environment.NEXT_PUBLIC_SITE_URL && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Missing NEXT_PUBLIC_SITE_URL:</strong> This is required for authentication redirects. Add
                      it to your Project Settings → Environment Variables with your site URL (e.g.,
                      https://yoursite.vercel.app)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Suggested actions based on diagnosis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diagnosis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debug Information</CardTitle>
                <CardDescription>Technical details for troubleshooting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">{JSON.stringify(diagnosis.diagnosis, null, 2)}</pre>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Check browser console for AuthProvider mounting logs and global auth state issues.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
