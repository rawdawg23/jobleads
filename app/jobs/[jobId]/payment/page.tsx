"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle, Clock, Copy, ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface Job {
  id: string
  registration: string
  make: string
  model: string
  year: number
  service_type: string
  customer_postcode: string
  status: string
  created_at: string
}

interface Payment {
  id: string
  amount: number
  status: string
  bank_transfer_reference: string
}

export default function JobPaymentPage() {
  const { user, loading, isCustomer } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isCustomer)) {
      router.push("/auth/login")
      return
    }

    if (user && jobId) {
      fetchJobAndPayment()
    }
  }, [user, loading, isCustomer, jobId, router])

  const fetchJobAndPayment = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/payment`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job details")
      }

      setJob(data.job)
      setPayment(data.payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job details")
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

  if (!job || !payment) {
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
          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
            {payment.status === "completed" ? "Payment Complete" : "Payment Pending"}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Payment</h1>
          <p className="text-slate-600">Complete your payment to activate your job posting</p>
        </div>

        {/* Job Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Vehicle:</span> {job.make} {job.model} ({job.year})
              </div>
              <div>
                <span className="font-medium">Registration:</span> {job.registration}
              </div>
              <div>
                <span className="font-medium">Service:</span> {job.service_type.replace("_", " ").toUpperCase()}
              </div>
              <div>
                <span className="font-medium">Location:</span> {job.customer_postcode}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {payment.status === "completed" ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Payment Complete
              </CardTitle>
              <CardDescription className="text-green-700">
                Your job has been posted and is now visible to dealers in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild className="flex-1">
                  <Link href={`/customer/jobs/${job.id}`}>View Job Status</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Bank Transfer Payment
              </CardTitle>
              <CardDescription>Transfer £{payment.amount.toFixed(2)} to complete your job posting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Please make a bank transfer using the details below. Your job will be activated once payment is
                  received and verified by our admin team.
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
                <p>• You'll receive an email confirmation once payment is verified</p>
                <p>• Your job will then be visible to dealers in your area</p>
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
