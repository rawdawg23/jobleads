import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/resend"
import { dealerApplicationTemplate } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, customerName, dealerName, jobId, quote } = await request.json()

    if (!customerEmail || !customerName || !dealerName || !jobId || !quote) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sendEmail({
      to: customerEmail,
      subject: "New Dealer Application - ECU Remap Pro",
      html: dealerApplicationTemplate(customerName, dealerName, jobId, quote),
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
