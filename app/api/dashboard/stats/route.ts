import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: NextRequest) {
	try {
		const supabase = createClient()
		const {
			data: { user: authUser },
		} = await supabase.auth.getUser()

		if (!authUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { data: profile } = await supabase.from("users").select("role").eq("id", authUser.id).single()
		const role = (profile?.role as string) || "customer"

		const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

		let stats = {
			totalJobs: 0,
			activeJobs: 0,
			completedJobs: 0,
			totalMessages: 0,
			pendingApplications: 0,
			totalEarnings: 0,
			thisMonthJobs: 0,
			successRate: 0,
		}
		let recentActivity: any[] = []

		if (role === "customer") {
			const { count: totalJobs = 0 } = await supabase
				.from("jobs")
				.select("id", { count: "exact", head: true })
				.eq("customer_id", authUser.id)

			const { count: activeJobs = 0 } = await supabase
				.from("jobs")
				.select("id", { count: "exact", head: true })
				.eq("customer_id", authUser.id)
				.in("status", ["open", "accepted", "in_progress"])

			const { count: completedJobs = 0 } = await supabase
				.from("jobs")
				.select("id", { count: "exact", head: true })
				.eq("customer_id", authUser.id)
				.eq("status", "completed")

			const { count: thisMonthJobs = 0 } = await supabase
				.from("jobs")
				.select("id", { count: "exact", head: true })
				.eq("customer_id", authUser.id)
				.gte("created_at", startOfMonth)

			const { count: totalMessages = 0 } = await supabase
				.from("messages")
				.select("id", { count: "exact", head: true })
				.or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`)

			stats = {
				totalJobs: totalJobs || 0,
				activeJobs: activeJobs || 0,
				completedJobs: completedJobs || 0,
				totalMessages: totalMessages || 0,
				pendingApplications: 0,
				totalEarnings: 0,
				thisMonthJobs: thisMonthJobs || 0,
				successRate: totalJobs ? Math.round(((completedJobs || 0) / (totalJobs || 1)) * 100) : 0,
			}

			recentActivity = []
		} else if (role === "dealer") {
			const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", authUser.id).single()

			if (dealer?.id) {
				const dealerId = dealer.id

				const { count: pendingApplications = 0 } = await supabase
					.from("job_applications")
					.select("id", { count: "exact", head: true })
					.eq("dealer_id", dealerId)

				const { count: activeJobs = 0 } = await supabase
					.from("jobs")
					.select("id", { count: "exact", head: true })
					.eq("dealer_id", dealerId)
					.in("status", ["accepted", "in_progress"])

				const { count: completedJobs = 0 } = await supabase
					.from("jobs")
					.select("id", { count: "exact", head: true })
					.eq("dealer_id", dealerId)
					.eq("status", "completed")

				const { count: thisMonthJobs = 0 } = await supabase
					.from("job_applications")
					.select("id", { count: "exact", head: true })
					.eq("dealer_id", dealerId)
					.gte("created_at", startOfMonth)

				const { data: completedRows } = await supabase
					.from("jobs")
					.select("dealer_quote")
					.eq("dealer_id", dealerId)
					.eq("status", "completed")

				const totalEarnings = (completedRows || []).reduce((sum, r: any) => sum + Number(r.dealer_quote || 0), 0)

				const { count: totalMessages = 0 } = await supabase
					.from("messages")
					.select("id", { count: "exact", head: true })
					.or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`)

				const totalJobs = (activeJobs || 0) + (completedJobs || 0)
				stats = {
					totalJobs: totalJobs,
					activeJobs: activeJobs || 0,
					completedJobs: completedJobs || 0,
					totalMessages: totalMessages || 0,
					pendingApplications: pendingApplications || 0,
					totalEarnings,
					thisMonthJobs: thisMonthJobs || 0,
					successRate: totalJobs ? Math.round(((completedJobs || 0) / totalJobs) * 100) : 0,
				}
			}
		}

		return NextResponse.json({ stats, recentActivity })
	} catch (error) {
		console.error("Dashboard stats error:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
