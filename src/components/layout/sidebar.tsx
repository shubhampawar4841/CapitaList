"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  TrendingUp,
  BarChart3,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Loans", href: "/loans", icon: TrendingUp },
  { name: "Insights", href: "/insights", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Finance</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </motion.div>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
      {/* Mobile Navigation */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card md:hidden">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

