import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"
import { JobModel, DealerModel, MessageModel } from "@/lib/redis/extended-models"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const result = await AuthService.getCurrentUser()
    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = result
    const formData = await request.formData()
    const jobId = formData.get("jobId") as string
    const dealerId = formData.get("dealerId") as string
    const message = formData.get("message") as string

    // Validate required fields
    if (!jobId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify job exists
    const job = await JobModel.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check permissions based on user role
    if (user.role === "customer" && job.customerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to job" }, { status: 403 })
    }

    if (user.role === "dealer") {
      if (!dealerId) {
        return NextResponse.json({ error: "Dealer ID required" }, { status: 400 })
      }

      // Verify dealer ownership
      const dealer = await DealerModel.findById(dealerId)
      if (!dealer || dealer.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized dealer access" }, { status: 403 })
      }

      // TODO: Check if dealer has applied to this job when job applications are implemented
      // For now, allow any dealer to message about any job
    }

    // Determine recipient based on sender role
    let recipientId: string
    if (user.role === "customer") {
      // Customer is messaging a dealer - need to determine which dealer
      if (!dealerId) {
        return NextResponse.json({ error: "Dealer ID required for customer messages" }, { status: 400 })
      }
      const dealer = await DealerModel.findById(dealerId)
      if (!dealer) {
        return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
      }
      recipientId = dealer.userId
    } else {
      // Dealer is messaging the customer
      recipientId = job.customerId
    }

    // Create message
    await MessageModel.create({
      jobId,
      senderId: user.id,
      recipientId,
      dealerId: dealerId || undefined,
      content: message.trim(),
    })

    return NextResponse.redirect(new URL(`/messages/${jobId}`, request.url))
  } catch (error) {
    console.error("Error in message sending:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
