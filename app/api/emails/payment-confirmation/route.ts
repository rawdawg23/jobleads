import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/resend"
import { paymentConfirmationTemplate } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, amount, type } = await request.json()

    if (!userEmail || !userName || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sendEmail({
      to: userEmail,
      subject: "Payment Confirmed - ECU Remap Pro",
      html: paymentConfirmationTemplate(userName, amount, type),
    })

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
