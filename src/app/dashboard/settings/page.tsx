"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <DashboardHeader title="Settings" description="Manage your account and preferences" />

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Profile Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input placeholder="John Doe" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input type="email" placeholder="john@example.com" className="mt-1" />
            </div>
            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-foreground">Email notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-foreground">Weekly progress updates</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  )
}
