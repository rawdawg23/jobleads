import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/resend"
import { jobPostedTemplate } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { jobId, customerEmail, customerName, vehicleReg } = await request.json()

    if (!jobId || !customerEmail || !customerName || !vehicleReg) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sendEmail({
      to: customerEmail,
      subject: "Job Posted Successfully - ECU Remap Pro",
      html: jobPostedTemplate(customerName, jobId, vehicleReg),
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
