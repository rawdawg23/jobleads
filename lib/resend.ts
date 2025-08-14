import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_3icPndwd_CrMmS3RiAc3QT5KqW2BFMyEq"

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is required")
}

export const resend = new Resend(RESEND_API_KEY)

export const sendEmail = async ({
  to,
  subject,
  html,
  from = "ECU Remap Pro <noreply@ecuremappro.com>",
}: {
  to: string
  subject: string
  html: string
  from?: string
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Email sending error:", error)
      return { success: false, error }
    }

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}
