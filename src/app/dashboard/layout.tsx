import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
