import { type NextRequest, NextResponse } from "next/server"
import { SessionModel, UserModel } from "@/lib/redis/models"
import { JobModel, PaymentModel } from "@/lib/redis/extended-models"

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const sessionId = request.cookies.get("ctek-session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = await SessionModel.findById(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = await UserModel.findById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const { jobId } = params

    const job = await JobModel.findById(jobId)
    if (!job || job.customerId !== user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const userPayments = await PaymentModel.findByUser(user.id)
    const payment = userPayments.find((p) => p.referenceId === jobId && p.paymentType === "job_posting")

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Generate bank transfer reference if not exists
    let updatedPayment = payment
    if (!payment.referenceId.startsWith("ECU")) {
      const reference = `ECU${jobId.slice(-8).toUpperCase()}`
      updatedPayment = (await PaymentModel.update(payment.id, { referenceId: reference })) || payment
    }

    return NextResponse.json({
      job,
      payment: updatedPayment,
      success: true,
    })
  } catch (error) {
    console.error("Payment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
