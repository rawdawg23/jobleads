"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Briefcase,
  MessageSquare,
  Shield,
  Building,
  CreditCard,
} from "lucide-react"

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: ("customer" | "dealer" | "admin")[]
  badge?: string
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["customer", "dealer", "admin"],
  },
  {
    label: "Browse Jobs",
    href: "/jobs",
    icon: Briefcase,
    roles: ["customer", "dealer"],
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    roles: ["customer", "dealer"],
  },
  {
    label: "My Applications",
    href: "/applications",
    icon: Briefcase,
    roles: ["dealer"],
  },
  {
    label: "Company Profile",
    href: "/dealer/profile",
    icon: Building,
    roles: ["dealer"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Dealer Management",
    href: "/admin/dealers",
    icon: Building,
    roles: ["admin"],
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    roles: ["admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["customer", "dealer", "admin"],
  },
]

export function RoleBasedNavigation() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading || !user) {
    return (
      <nav className="glass-card p-4">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-glass-light rounded animate-pulse"></div>
          ))}
        </div>
      </nav>
    )
  }

  const allowedItems = navigationItems.filter((item) => item.roles.includes(user.role))

  return (
    <nav className="glass-card p-4 space-y-2">
      <div className="mb-4 pb-4 border-b border-glass-border">
        <div className="flex items-center space-x-3">
          <div className="glass-avatar">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-white font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-glass-text capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {allowedItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start ${
              isActive ? "glass-button-primary" : "glass-button-ghost hover:bg-glass-light/50"
            }`}
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
              {item.badge && (
                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{item.badge}</span>
              )}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
