"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle, Clock, Copy, ArrowLeft, Building } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface Dealer {
  id: string
  business_name: string
  business_postcode: string
  status: string
  created_at: string
}

interface Payment {
  id: string
  amount: number
  status: string
  bank_transfer_reference: string
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function DealerPaymentPage() {
  const { user, loading, isDealer } = useAuth()
  const router = useRouter()
  const params = useParams()
  const dealerId = params.dealerId as string

  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && dealerId) {
      fetchDealerAndPayment()
    }
  }, [user, loading, dealerId, router])

  const fetchDealerAndPayment = async () => {
    try {
      const response = await fetch(`/api/dealers/${dealerId}/payment`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch dealer details")
      }

      setDealer(data.dealer)
      setPayment(data.payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dealer details")
    } finally {
      setLoadingData(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const bankDetails = {
    accountName: "ECU Remap Pro Ltd",
    sortCode: "12-34-56",
    accountNumber: "12345678",
    reference: payment?.bank_transfer_reference || "",
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dealer || !payment) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <Badge
            variant={
              payment.status === "completed"
                ? "default"
                : dealer.status === "pending"
                  ? "secondary"
                  : dealer.status === "active"
                    ? "default"
                    : "destructive"
            }
          >
            {payment.status === "completed" && dealer.status === "active"
              ? "Active Dealer"
              : payment.status === "completed"
                ? "Payment Complete - Pending Approval"
                : "Payment Pending"}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dealer Subscription</h1>
          <p className="text-slate-600">Complete your payment to activate your dealer account</p>
        </div>

        {/* Dealer Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Dealer Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Business:</span> {dealer.business_name}
              </div>
              <div>
                <span className="font-medium">Location:</span> {dealer.business_postcode}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={dealer.status === "active" ? "default" : "secondary"}>{dealer.status}</Badge>
              </div>
              <div>
                <span className="font-medium">Applied:</span> {new Date(dealer.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {payment.status === "completed" && dealer.status === "active" ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Dealer Account Active
              </CardTitle>
              <CardDescription className="text-green-700">
                Your dealer account is active and you can now browse and apply for jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild className="flex-1">
                  <Link href="/dealer/jobs">Browse Jobs</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/dealer/profile">Manage Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : payment.status === "completed" ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Clock className="h-5 w-5" />
                Payment Complete - Pending Approval
              </CardTitle>
              <CardDescription className="text-blue-700">
                Your payment has been received. Your application is being reviewed by our admin team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-1 mb-4">
                <p>• Applications are typically reviewed within 1-2 business days</p>
                <p>• You'll receive an email notification once approved</p>
                <p>• Your subscription will begin once your account is activated</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Monthly Subscription Payment
              </CardTitle>
              <CardDescription>Transfer £{payment.amount.toFixed(2)} to activate your dealer account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Please make a bank transfer using the details below. Your application will be reviewed once payment is
                  received and verified.
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Account Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{bankDetails.accountName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountName)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Sort Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{bankDetails.sortCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.sortCode)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{bankDetails.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountNumber)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="font-medium">Reference:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-600 font-bold">{bankDetails.reference}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.reference)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="font-medium text-lg">Amount:</span>
                  <span className="font-bold text-lg">£{payment.amount.toFixed(2)}</span>
                </div>
              </div>

              {copied && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Copied to clipboard!</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-slate-600 space-y-1">
                <p>• Please use the exact reference number provided above</p>
                <p>• Payments are typically processed within 1-2 business hours</p>
                <p>• Your application will be reviewed by our admin team after payment</p>
                <p>• You'll receive email notifications for payment confirmation and approval</p>
                <p>• Monthly billing will begin once your account is activated</p>
              </div>

              <Button asChild className="w-full">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
