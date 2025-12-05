"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Brain, BookOpen, TrendingUp, Settings, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createSupabaseClient } from "@/lib/supabase/client"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Assessment",
    href: "/dashboard/assessment",
    icon: Brain,
  },
  {
    label: "Recommendations",
    href: "/dashboard/recommendations",
    icon: BookOpen,
  },
  {
    label: "Progress",
    href: "/dashboard/progress",
    icon: TrendingUp,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-muted rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 z-30",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">CareerPath</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" asChild>
            <button onClick={handleLogout} className="flex items-center w-full">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-20" onClick={() => setIsOpen(false)} />}
    </>
  )
}
