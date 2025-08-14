"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, CreditCard, CheckCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminSettingsPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [bankSettings, setBankSettings] = useState({
    accountName: "ECU Remap Pro Ltd",
    sortCode: "12-34-56",
    accountNumber: "12345678",
    instructions: "Please use the exact reference number provided with your payment.",
  })
  const [platformSettings, setPlatformSettings] = useState({
    jobPostingFee: 5.0,
    dealerSubscriptionFee: 100.0,
    maxDealerRadius: 100,
    minDealerRadius: 10,
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
    }
  }, [user, loading, isAdmin, router])

  const saveSettings = async () => {
    setSaveLoading(true)
    setSuccess("")

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankSettings,
          platformSettings,
        }),
      })

      if (response.ok) {
        setSuccess("Settings saved successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">System Settings</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Configuration</h1>
          <p className="text-slate-600">Manage bank transfer gateway and platform settings</p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Bank Transfer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Bank Transfer Gateway
              </CardTitle>
              <CardDescription>Configure bank account details for customer payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={bankSettings.accountName}
                    onChange={(e) => setBankSettings((prev) => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortCode">Sort Code</Label>
                  <Input
                    id="sortCode"
                    placeholder="12-34-56"
                    value={bankSettings.sortCode}
                    onChange={(e) => setBankSettings((prev) => ({ ...prev, sortCode: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="12345678"
                    value={bankSettings.accountNumber}
                    onChange={(e) => setBankSettings((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Payment Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Additional instructions for customers making payments..."
                  value={bankSettings.instructions}
                  onChange={(e) => setBankSettings((prev) => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure pricing and operational parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobPostingFee">Job Posting Fee (£)</Label>
                  <Input
                    id="jobPostingFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={platformSettings.jobPostingFee}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        jobPostingFee: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealerSubscriptionFee">Dealer Subscription Fee (£/month)</Label>
                  <Input
                    id="dealerSubscriptionFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={platformSettings.dealerSubscriptionFee}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        dealerSubscriptionFee: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minDealerRadius">Minimum Dealer Radius (miles)</Label>
                  <Input
                    id="minDealerRadius"
                    type="number"
                    min="1"
                    max="50"
                    value={platformSettings.minDealerRadius}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        minDealerRadius: Number.parseInt(e.target.value) || 10,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDealerRadius">Maximum Dealer Radius (miles)</Label>
                  <Input
                    id="maxDealerRadius"
                    type="number"
                    min="50"
                    max="200"
                    value={platformSettings.maxDealerRadius}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        maxDealerRadius: Number.parseInt(e.target.value) || 100,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saveLoading} className="px-8">
              {saveLoading && <Settings className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
