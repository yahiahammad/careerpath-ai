"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Shield, Lock, Smartphone, Monitor, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { createSupabaseClient } from "@/lib/supabase/client"

export default function SecurityPage() {
  const { t } = useLanguage()
  const supabase = createSupabaseClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t("security.passwordMismatch"))
      setIsLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError(t("security.passwordTooShort"))
      setIsLoading(false)
      return
    }

    try {
      // Update password in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(t("security.passwordUpdated"))
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      setError(err.message || t("security.passwordUpdateFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FAToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked)
    // Here you would implement actual 2FA setup
    // For now, just update the state
  }

  return (
    <div>
      <DashboardHeader title={t("security.title")} description={t("security.description")} />

      <div className="max-w-3xl space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Change Password */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t("security.changePassword")}
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">{t("security.currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">{t("security.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className="mt-1"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("security.passwordTooShort")}
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t("security.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("common.update")} {t("security.changePassword")}
            </Button>
          </form>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {t("security.twoFactor")}
          </h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("security.twoFactor")}</Label>
              <p className="text-sm text-muted-foreground">{t("security.twoFactorDesc")}</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handle2FAToggle}
            />
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t("security.twoFactorEnabled")}
              </p>
            </div>
          )}
        </Card>

        {/* Active Sessions */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            {t("security.activeSessions")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("security.activeSessions")}</Label>
                <p className="text-sm text-muted-foreground">{t("security.activeSessionsDesc")}</p>
              </div>
              <Button variant="outline" size="sm">
                {t("security.viewSessions")}
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("security.currentDevice")}</p>
                    <p className="text-xs text-muted-foreground">{t("security.deviceInfo")}</p>
                  </div>
                </div>
                <span className="text-xs text-primary font-medium">{t("security.active")}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Login History */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("security.loginHistory")}
          </h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("security.loginHistory")}</Label>
              <p className="text-sm text-muted-foreground">{t("security.loginHistoryDesc")}</p>
            </div>
            <Button variant="outline" size="sm">
              {t("security.viewHistory")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

