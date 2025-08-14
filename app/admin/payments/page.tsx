"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, CheckCircle, Clock, Search, Filter, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  payment_type: string
  reference_id: string
  status: string
  bank_transfer_reference: string
  admin_notes: string
  created_at: string
  updated_at: string
  user: {
    first_name: string
    last_name: string
    email: string
  }
  job?: {
    registration: string
    make: string
    model: string
  }
  dealer?: {
    business_name: string
  }
}

export default function AdminPaymentsPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      fetchPayments()
    }
  }, [user, isAdmin])

  useEffect(() => {
    filterPayments()
  }, [payments, filters])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments)
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    } finally {
      setLoadingPayments(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    if (filters.status !== "all") {
      filtered = filtered.filter((payment) => payment.status === filters.status)
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((payment) => payment.payment_type === filters.type)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (payment) =>
          payment.user.email.toLowerCase().includes(search) ||
          payment.user.first_name.toLowerCase().includes(search) ||
          payment.user.last_name.toLowerCase().includes(search) ||
          payment.bank_transfer_reference.toLowerCase().includes(search) ||
          (payment.job && payment.job.registration.toLowerCase().includes(search)) ||
          (payment.dealer && payment.dealer.business_name.toLowerCase().includes(search)),
      )
    }

    setFilteredPayments(filtered)
  }

  const updatePaymentStatus = async (paymentId: string, status: string, notes: string) => {
    setUpdateLoading(true)

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes }),
      })

      if (response.ok) {
        await fetchPayments()
        setSelectedPayment(null)
      }
    } catch (error) {
      console.error("Failed to update payment:", error)
    } finally {
      setUpdateLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "refunded":
        return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "job_posting":
        return <Badge variant="outline">Job Posting</Badge>
      case "dealer_subscription":
        return <Badge className="bg-blue-100 text-blue-800">Dealer Subscription</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  if (loading || loadingPayments) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading payments...</p>
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
            <CreditCard className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Payment Management</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Admin: {user.first_name}</span>
            <Button variant="outline" asChild>
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Payments</p>
                  <p className="text-2xl font-bold">{payments.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {payments.filter((p) => p.status === "pending").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter((p) => p.status === "completed").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Value</p>
                  <p className="text-2xl font-bold">£{payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job_posting">Job Posting</SelectItem>
                    <SelectItem value="dealer_subscription">Dealer Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by email, name, reference, or registration..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>Manage and verify bank transfer payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.user.first_name} {payment.user.last_name}
                          </div>
                          <div className="text-sm text-slate-600">{payment.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(payment.payment_type)}</TableCell>
                      <TableCell className="font-medium">£{payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                          {payment.bank_transfer_reference}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                              <DialogDescription>Review and update payment status</DialogDescription>
                            </DialogHeader>
                            {selectedPayment && (
                              <PaymentDetailsDialog
                                payment={selectedPayment}
                                onUpdate={updatePaymentStatus}
                                loading={updateLoading}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-slate-600">No payments found matching your criteria</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PaymentDetailsDialog({
  payment,
  onUpdate,
  loading,
}: {
  payment: Payment
  onUpdate: (id: string, status: string, notes: string) => void
  loading: boolean
}) {
  const [status, setStatus] = useState(payment.status)
  const [notes, setNotes] = useState(payment.admin_notes || "")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Customer:</span> {payment.user.first_name} {payment.user.last_name}
        </div>
        <div>
          <span className="font-medium">Email:</span> {payment.user.email}
        </div>
        <div>
          <span className="font-medium">Amount:</span> £{payment.amount.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Type:</span> {payment.payment_type.replace("_", " ")}
        </div>
        <div>
          <span className="font-medium">Reference:</span> {payment.bank_transfer_reference}
        </div>
        <div>
          <span className="font-medium">Created:</span> {new Date(payment.created_at).toLocaleString()}
        </div>
      </div>

      {payment.job && (
        <div className="bg-slate-50 p-3 rounded">
          <h4 className="font-medium mb-2">Job Details</h4>
          <p className="text-sm">
            {payment.job.make} {payment.job.model} - {payment.job.registration}
          </p>
        </div>
      )}

      {payment.dealer && (
        <div className="bg-slate-50 p-3 rounded">
          <h4 className="font-medium mb-2">Dealer Details</h4>
          <p className="text-sm">{payment.dealer.business_name}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Payment Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Admin Notes</Label>
        <Textarea
          placeholder="Add notes about this payment..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onUpdate(payment.id, status, notes)} disabled={loading} className="flex-1">
          {loading && <Clock className="mr-2 h-4 w-4 animate-spin" />}
          Update Payment
        </Button>
      </div>
    </div>
  )
}
