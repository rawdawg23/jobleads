"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, Users, Shield, Activity, Zap, RefreshCw } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  details?: any
}

export function IntegrationTest() {
  const { user, loading } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const supabase = createClient()

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = []

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)
      testResults.push({
        name: "Database Connection",
        status: error ? "error" : "success",
        message: error ? error.message : "Successfully connected to Supabase database",
        details: { data, error },
      })
    } catch (error) {
      testResults.push({
        name: "Database Connection",
        status: "error",
        message: "Failed to connect to database",
        details: error,
      })
    }

    // Test 2: User Authentication
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      testResults.push({
        name: "User Authentication",
        status: session ? "success" : "error",
        message: session ? `Authenticated as ${session.user.email}` : "No active session",
        details: { session: !!session, user: session?.user?.email },
      })
    } catch (error) {
      testResults.push({
        name: "User Authentication",
        status: "error",
        message: "Authentication check failed",
        details: error,
      })
    }

    // Test 3: User Profile Data
    if (user) {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        testResults.push({
          name: "User Profile Data",
          status: error ? "error" : "success",
          message: error ? error.message : `Profile loaded for ${data.first_name} ${data.last_name}`,
          details: { profile: data, error },
        })
      } catch (error) {
        testResults.push({
          name: "User Profile Data",
          status: "error",
          message: "Failed to load user profile",
          details: error,
        })
      }
    }

    // Test 4: Applications Data
    if (user) {
      try {
        const { data, error } = await supabase.from("applications").select("*").eq("user_id", user.id)

        testResults.push({
          name: "Applications Data",
          status: error ? "error" : "success",
          message: error ? error.message : `Found ${data?.length || 0} applications`,
          details: { count: data?.length, error },
        })
      } catch (error) {
        testResults.push({
          name: "Applications Data",
          status: "error",
          message: "Failed to load applications",
          details: error,
        })
      }
    }

    // Test 5: Jobs Data
    try {
      const { data, error } = await supabase.from("jobs").select("*").limit(5)

      testResults.push({
        name: "Jobs Data",
        status: error ? "error" : "success",
        message: error ? error.message : `Found ${data?.length || 0} jobs in database`,
        details: { count: data?.length, error },
      })
    } catch (error) {
      testResults.push({
        name: "Jobs Data",
        status: "error",
        message: "Failed to load jobs",
        details: error,
      })
    }

    // Test 6: Companies Data
    try {
      const { data, error } = await supabase.from("companies").select("*").limit(5)

      testResults.push({
        name: "Companies Data",
        status: error ? "error" : "success",
        message: error ? error.message : `Found ${data?.length || 0} companies in database`,
        details: { count: data?.length, error },
      })
    } catch (error) {
      testResults.push({
        name: "Companies Data",
        status: "error",
        message: "Failed to load companies",
        details: error,
      })
    }

    // Test 7: Real-time Subscription
    try {
      const channel = supabase
        .channel("test_channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {})
        .subscribe()

      const subscriptionStatus = channel.state

      testResults.push({
        name: "Real-time Subscriptions",
        status: subscriptionStatus === "subscribed" ? "success" : "error",
        message:
          subscriptionStatus === "subscribed"
            ? "Real-time subscriptions working"
            : `Subscription status: ${subscriptionStatus}`,
        details: { status: subscriptionStatus },
      })

      // Clean up
      supabase.removeChannel(channel)
    } catch (error) {
      testResults.push({
        name: "Real-time Subscriptions",
        status: "error",
        message: "Failed to test real-time subscriptions",
        details: error,
      })
    }

    setTests(testResults)
    setIsRunning(false)
  }

  useEffect(() => {
    if (!loading) {
      runTests()
    }
  }, [loading])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <RefreshCw className="h-5 w-5 text-yellow-400 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-500/30 bg-green-500/10"
      case "error":
        return "border-red-500/30 bg-red-500/10"
      default:
        return "border-yellow-500/30 bg-yellow-500/10"
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const totalTests = tests.length

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-3">
            <Database className="h-6 w-6 text-primary" />
            Live Data Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{successCount}</div>
              <div className="text-sm text-glass-text">Passed</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{errorCount}</div>
              <div className="text-sm text-glass-text">Failed</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalTests}</div>
              <div className="text-sm text-glass-text">Total Tests</div>
            </div>
          </div>

          {/* Overall Status */}
          <Alert className={`${errorCount === 0 ? "glass-alert-success" : "glass-alert-error"}`}>
            <Activity className="h-4 w-4" />
            <AlertDescription className={errorCount === 0 ? "text-green-300" : "text-red-300"}>
              {errorCount === 0
                ? "All systems operational! Live data integration is working perfectly."
                : `${errorCount} test(s) failed. Please check the details below.`}
            </AlertDescription>
          </Alert>

          {/* Test Results */}
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium text-white">{test.name}</h4>
                      <p className="text-sm text-glass-text">{test.message}</p>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      test.status === "success"
                        ? "bg-green-500/20 text-green-400"
                        : test.status === "error"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {test.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Button onClick={runTests} disabled={isRunning} className="glass-button-primary">
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Tests Again
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Info Card */}
      {user && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              Current User Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-white mb-2">User Details</h4>
                <div className="space-y-1 text-sm text-glass-text">
                  <p>
                    <span className="text-white">Name:</span> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <span className="text-white">Email:</span> {user.email}
                  </p>
                  <p>
                    <span className="text-white">Role:</span> <Badge className="glass-badge ml-1">{user.role}</Badge>
                  </p>
                  <p>
                    <span className="text-white">ID:</span> {user.id}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Session Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-glass-text">Authenticated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm text-glass-text">Role-based access active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-glass-text">Real-time updates enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
