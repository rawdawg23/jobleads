"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AppUser {
	id: string
	email: string
	first_name: string
	last_name: string
	phone?: string
	role: "customer" | "dealer" | "admin"
}

interface AuthContextType {
	user: AppUser | null
	loading: boolean
	signIn: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>
	signUp: (
		email: string,
		password: string,
		userData: {
			firstName: string
			lastName: string
			phoneNumber?: string
			role?: "customer" | "dealer" | "admin"
		},
	) => Promise<{ error?: string; success?: string }>
	signOut: () => Promise<void>
	isCustomer: boolean
	isDealer: boolean
	isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AppUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [mounted, setMounted] = useState(false)
	const router = useRouter()
	const supabase = createClient()

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (!mounted) return

		async function loadSession() {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession()

				if (!session) {
					setUser(null)
					return
				}

				const authUser = session.user
				const { data: profile } = await supabase
					.from("users")
					.select("first_name, last_name, role, phone")
					.eq("id", authUser.id)
					.single()

				setUser({
					id: authUser.id,
					email: authUser.email || "",
					first_name: profile?.first_name || "",
					last_name: profile?.last_name || "",
					role: (profile?.role as AppUser["role"]) || "customer",
					phone: profile?.phone,
				})
			} catch (e) {
				setUser(null)
			} finally {
				setLoading(false)
			}
		}

		loadSession()

		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) {
				setUser(null)
				return
			}
			// Refresh profile on auth state change
			;(async () => {
				const authUser = session.user
				const { data: profile } = await supabase
					.from("users")
					.select("first_name, last_name, role, phone")
					.eq("id", authUser.id)
					.single()
				setUser({
					id: authUser.id,
					email: authUser.email || "",
					first_name: profile?.first_name || "",
					last_name: profile?.last_name || "",
					role: (profile?.role as AppUser["role"]) || "customer",
					phone: profile?.phone,
				})
			})()
		})

		return () => {
			sub.subscription.unsubscribe()
		}
	}, [mounted, supabase])

	const signIn = async (email: string, password: string) => {
		try {
			const response = await fetch("/auth/login", { method: "GET" })
			const result = await fetch("/auth/login")
			// use server action instead (form posts use server actions). Provide a fallback for imperative call.
			const { data, error } = await supabase.auth.signInWithPassword({ email, password })
			if (error) return { error: error.message }
			return { success: true }
		} catch {
			return { error: "Unable to sign in" }
		}
	}

	const signUp = async (
		email: string,
		password: string,
		userData: { firstName: string; lastName: string; phoneNumber?: string; role?: "customer" | "dealer" | "admin" },
	) => {
		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						first_name: userData.firstName,
						last_name: userData.lastName,
						phone: userData.phoneNumber || "",
						role: userData.role || "customer",
					},
					emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
						? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
						: undefined,
				},
			})
			if (error) return { error: error.message }
			return { success: "Check your email to confirm your account." }
		} catch {
			return { error: "Unable to sign up" }
		}
	}

	const signOut = async () => {
		await supabase.auth.signOut()
		router.push("/auth/login")
	}

	if (!mounted) {
		return null as any
	}

	const value: AuthContextType = {
		user,
		loading,
		signIn,
		signUp,
		signOut,
		isCustomer: user?.role === "customer",
		isDealer: user?.role === "dealer",
		isAdmin: user?.role === "admin",
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
