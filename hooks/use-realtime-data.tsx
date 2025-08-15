"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseRealtimeDataOptions {
  table: string
  filter?: { column: string; value: any }
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
}

export function useRealtimeData<T = any>(options: UseRealtimeDataOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(options.table).select("*")

      if (options.filter) {
        query = query.eq(options.filter.column, options.filter.value)
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false })
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: fetchedData, error: fetchError } = await query

      if (fetchError) throw fetchError

      setData(fetchedData || [])
    } catch (err: any) {
      console.error(`Error fetching ${options.table}:`, err)
      setError(err.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [options.table, options.filter, options.orderBy, options.limit])

  useEffect(() => {
    fetchData()

    // Set up real-time subscription
    const newChannel = supabase
      .channel(`realtime-${options.table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: options.table,
          filter: options.filter ? `${options.filter.column}=eq.${options.filter.value}` : undefined,
        },
        (payload) => {
          console.log(`[v0] Real-time update for ${options.table}:`, payload)

          if (payload.eventType === "INSERT") {
            setData((current) => [payload.new as T, ...current])
          } else if (payload.eventType === "UPDATE") {
            setData((current) => current.map((item: any) => (item.id === payload.new.id ? (payload.new as T) : item)))
          } else if (payload.eventType === "DELETE") {
            setData((current) => current.filter((item: any) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    setChannel(newChannel)

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel)
      }
    }
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Hook for real-time stats
export function useRealtimeStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDealers: 0,
    activeJobs: 0,
    totalVehicles: 0,
    activeDynoSessions: 0,
    carMeetEvents: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    pendingApplications: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      const [
        usersResult,
        companiesResult,
        jobsResult,
        vehiclesResult,
        dynoSessionsResult,
        carMeetsResult,
        bookingsResult,
        applicationsResult,
        messagesResult,
      ] = await Promise.allSettled([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }),
        supabase.from("dyno_sessions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("car_meet_locations").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
      ])

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .eq("status", "completed")

      const monthlyRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

      setStats({
        totalUsers: usersResult.status === "fulfilled" ? usersResult.value.count || 0 : 0,
        activeDealers: companiesResult.status === "fulfilled" ? companiesResult.value.count || 0 : 0,
        activeJobs: jobsResult.status === "fulfilled" ? jobsResult.value.count || 0 : 0,
        totalVehicles: vehiclesResult.status === "fulfilled" ? vehiclesResult.value.count || 0 : 0,
        activeDynoSessions: dynoSessionsResult.status === "fulfilled" ? dynoSessionsResult.value.count || 0 : 0,
        carMeetEvents: carMeetsResult.status === "fulfilled" ? carMeetsResult.value.count || 0 : 0,
        totalBookings: bookingsResult.status === "fulfilled" ? bookingsResult.value.count || 0 : 0,
        monthlyRevenue,
        pendingApplications: applicationsResult.status === "fulfilled" ? applicationsResult.value.count || 0 : 0,
        unreadMessages: messagesResult.status === "fulfilled" ? messagesResult.value.count || 0 : 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    // Set up real-time subscriptions for stats updates
    const channels = [
      supabase
        .channel("users-stats")
        .on("postgres_changes", { event: "*", schema: "public", table: "users" }, fetchStats),
      supabase
        .channel("jobs-stats")
        .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, fetchStats),
      supabase
        .channel("bookings-stats")
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchStats),
      supabase
        .channel("payments-stats")
        .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, fetchStats),
    ]

    channels.forEach((channel) => channel.subscribe())

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}

// Hook for real-time notifications
export function useRealtimeNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0)
    }

    fetchNotifications()

    // Real-time subscription for notifications
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((current) => [payload.new, ...current.slice(0, 9)])
            setUnreadCount((current) => current + 1)
          } else if (payload.eventType === "UPDATE") {
            setNotifications((current) => current.map((item) => (item.id === payload.new.id ? payload.new : item)))
            if (payload.new.is_read && !payload.old.is_read) {
              setUnreadCount((current) => Math.max(0, current - 1))
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)
  }

  const markAllAsRead = async () => {
    if (!userId) return
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
