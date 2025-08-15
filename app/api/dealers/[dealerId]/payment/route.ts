import { type NextRequest, NextResponse } from "next/server"
import { SessionModel, UserModel } from "@/lib/redis/models"
import { DealerModel, PaymentModel } from "@/lib/redis/extended-models"

export async function GET(request: NextRequest, { params }: { params: { dealerId: string } }) {
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

    const { dealerId } = params

    const dealer = await DealerModel.findById(dealerId)
    if (!dealer || dealer.userId !== user.id) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    const userPayments = await PaymentModel.findByUser(user.id)
    const payment = userPayments.find((p) => p.referenceId === dealerId && p.paymentType === "dealer_subscription")

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Generate bank transfer reference if not exists
    let updatedPayment = payment
    if (!payment.referenceId.startsWith("DEALER")) {
      const reference = `DEALER${dealerId.slice(-8).toUpperCase()}`
      updatedPayment = (await PaymentModel.update(payment.id, { referenceId: reference })) || payment
    }

    return NextResponse.json({
      dealer,
      payment: updatedPayment,
      success: true,
    })
  } catch (error) {
    console.error("Dealer payment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
