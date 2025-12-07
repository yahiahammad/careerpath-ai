"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Moon, Sun, Bell, Mail, Globe, Shield, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/LanguageContext"
import { createSupabaseClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const supabase = createSupabaseClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const [settings, setSettings] = useState({
    darkMode: theme === "dark",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    marketingEmails: false,
    language: language,
    timezone: "UTC",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setSettings((prev) => ({ ...prev, darkMode: theme === "dark", language: language }))
    }
  }, [theme, mounted, language])

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
    setSettings((prev) => ({ ...prev, darkMode: checked }))
  }

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    if (key === "language") {
      setLanguage(value as "en" | "es" | "fr" | "de" | "ar")
    }
  }

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem("userSettings", JSON.stringify(settings))
    // You can also save to Supabase here
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error("User not found")
      }

      // Try to delete from common tables that might exist
      // Delete from users table if it exists
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      // Delete from profiles table if it exists
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      
      // Delete from user_profiles table if it exists
      const { error: userProfilesError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id)
      
      // Note: Actual auth user deletion requires admin privileges
      // For now, we delete related data and sign out
      // The auth user will remain but won't be accessible
      // To fully delete, you'd need a server-side function with admin access
      
      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        throw signOutError
      }
      
      // Redirect to home
      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("Delete account error:", error)
      alert(error.message || t("security.deleteAccountFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  if (!mounted) {
    return (
      <div>
        <DashboardHeader title={t("settings.title")} description={t("settings.description")} />
        <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title={t("settings.title")} description={t("settings.description")} />

      <div className="max-w-3xl space-y-6">
        {/* Appearance */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {t("settings.appearance")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">
                  {t("settings.darkMode")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.darkModeDesc")}
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t("settings.notifications")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">{t("settings.emailNotifications")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.emailNotificationsDesc")}
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">{t("settings.pushNotifications")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.pushNotificationsDesc")}
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">{t("settings.weeklyReports")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.weeklyReportsDesc")}
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">{t("settings.marketingEmails")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.marketingEmailsDesc")}
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Language & Region */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("settings.language")} & {t("settings.region")}
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t("settings.language")}</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSettingChange("language", value)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t("settings.timezone")}</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleSettingChange("timezone", value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("settings.privacy")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.accountSecurity")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.accountSecurityDesc")}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/security">
                  {t("settings.securitySettings")}
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/20">
          <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {t("settings.dangerZone")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-destructive">{t("settings.deleteAccount")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.deleteAccountDesc")}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {t("settings.deleteAccount")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("settings.deleteAccount")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("security.deleteAccountConfirm")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? t("common.loading") : t("common.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            {t("settings.saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  )
}
