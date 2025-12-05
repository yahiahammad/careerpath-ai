"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "en" | "es" | "fr" | "de" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.assessment": "Assessment",
    "nav.recommendations": "Recommendations",
    "nav.progress": "Progress",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    
    // Settings
    "settings.title": "Settings",
    "settings.description": "Manage your account and preferences",
    "settings.appearance": "Appearance",
    "settings.darkMode": "Dark Mode",
    "settings.darkModeDesc": "Switch between light and dark theme",
    "settings.notifications": "Notifications",
    "settings.emailNotifications": "Email Notifications",
    "settings.emailNotificationsDesc": "Receive email updates about your account activity",
    "settings.pushNotifications": "Push Notifications",
    "settings.pushNotificationsDesc": "Receive browser push notifications",
    "settings.weeklyReports": "Weekly Progress Reports",
    "settings.weeklyReportsDesc": "Get a weekly summary of your learning progress",
    "settings.marketingEmails": "Marketing Emails",
    "settings.marketingEmailsDesc": "Receive emails about new features and updates",
    "settings.language": "Language",
    "settings.timezone": "Timezone",
    "settings.privacy": "Privacy & Security",
    "settings.dataPrivacy": "Data Privacy",
    "settings.dataPrivacyDesc": "Your data is encrypted and stored securely",
    "settings.viewPrivacyPolicy": "View Privacy Policy",
    "settings.accountSecurity": "Account Security",
    "settings.accountSecurityDesc": "Manage your account security settings",
    "settings.securitySettings": "Security Settings",
    "settings.dangerZone": "Danger Zone",
    "settings.deleteAccount": "Delete Account",
    "settings.deleteAccountDesc": "Permanently delete your account and all associated data",
    "settings.saveChanges": "Save Changes",
    
    // Security Settings
    "security.title": "Security Settings",
    "security.description": "Manage your account security and privacy",
    "security.changePassword": "Change Password",
    "security.currentPassword": "Current Password",
    "security.newPassword": "New Password",
    "security.confirmPassword": "Confirm Password",
    "security.twoFactor": "Two-Factor Authentication",
    "security.twoFactorDesc": "Add an extra layer of security to your account",
    "security.enable2FA": "Enable 2FA",
    "security.activeSessions": "Active Sessions",
    "security.activeSessionsDesc": "Manage devices that are currently signed in",
    "security.viewSessions": "View All Sessions",
    "security.loginHistory": "Login History",
    "security.loginHistoryDesc": "View your recent login activity",
    "security.viewHistory": "View History",
    
    // Common
    "common.welcome": "Welcome back",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.update": "Update",
  },
  es: {
    // Navigation
    "nav.dashboard": "Panel",
    "nav.assessment": "Evaluación",
    "nav.recommendations": "Recomendaciones",
    "nav.progress": "Progreso",
    "nav.settings": "Configuración",
    "nav.profile": "Perfil",
    "nav.logout": "Cerrar sesión",
    
    // Settings
    "settings.title": "Configuración",
    "settings.description": "Administra tu cuenta y preferencias",
    "settings.appearance": "Apariencia",
    "settings.darkMode": "Modo oscuro",
    "settings.darkModeDesc": "Cambiar entre tema claro y oscuro",
    "settings.notifications": "Notificaciones",
    "settings.emailNotifications": "Notificaciones por correo",
    "settings.emailNotificationsDesc": "Recibe actualizaciones por correo sobre la actividad de tu cuenta",
    "settings.pushNotifications": "Notificaciones push",
    "settings.pushNotificationsDesc": "Recibe notificaciones push del navegador",
    "settings.weeklyReports": "Informes semanales de progreso",
    "settings.weeklyReportsDesc": "Obtén un resumen semanal de tu progreso de aprendizaje",
    "settings.marketingEmails": "Correos de marketing",
    "settings.marketingEmailsDesc": "Recibe correos sobre nuevas funciones y actualizaciones",
    "settings.language": "Idioma",
    "settings.timezone": "Zona horaria",
    "settings.privacy": "Privacidad y seguridad",
    "settings.dataPrivacy": "Privacidad de datos",
    "settings.dataPrivacyDesc": "Tus datos están encriptados y almacenados de forma segura",
    "settings.viewPrivacyPolicy": "Ver política de privacidad",
    "settings.accountSecurity": "Seguridad de la cuenta",
    "settings.accountSecurityDesc": "Administra la configuración de seguridad de tu cuenta",
    "settings.securitySettings": "Configuración de seguridad",
    "settings.dangerZone": "Zona de peligro",
    "settings.deleteAccount": "Eliminar cuenta",
    "settings.deleteAccountDesc": "Eliminar permanentemente tu cuenta y todos los datos asociados",
    "settings.saveChanges": "Guardar cambios",
    
    // Security Settings
    "security.title": "Configuración de seguridad",
    "security.description": "Administra la seguridad y privacidad de tu cuenta",
    "security.changePassword": "Cambiar contraseña",
    "security.currentPassword": "Contraseña actual",
    "security.newPassword": "Nueva contraseña",
    "security.confirmPassword": "Confirmar contraseña",
    "security.twoFactor": "Autenticación de dos factores",
    "security.twoFactorDesc": "Añade una capa extra de seguridad a tu cuenta",
    "security.enable2FA": "Habilitar 2FA",
    "security.activeSessions": "Sesiones activas",
    "security.activeSessionsDesc": "Administra los dispositivos que están actualmente conectados",
    "security.viewSessions": "Ver todas las sesiones",
    "security.loginHistory": "Historial de inicio de sesión",
    "security.loginHistoryDesc": "Ver tu actividad reciente de inicio de sesión",
    "security.viewHistory": "Ver historial",
    
    // Common
    "common.welcome": "Bienvenido de nuevo",
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.update": "Actualizar",
  },
  fr: {
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.assessment": "Évaluation",
    "nav.recommendations": "Recommandations",
    "nav.progress": "Progrès",
    "nav.settings": "Paramètres",
    "nav.profile": "Profil",
    "nav.logout": "Déconnexion",
    
    // Settings
    "settings.title": "Paramètres",
    "settings.description": "Gérez votre compte et vos préférences",
    "settings.appearance": "Apparence",
    "settings.darkMode": "Mode sombre",
    "settings.darkModeDesc": "Basculer entre le thème clair et sombre",
    "settings.notifications": "Notifications",
    "settings.emailNotifications": "Notifications par e-mail",
    "settings.emailNotificationsDesc": "Recevez des mises à jour par e-mail sur l'activité de votre compte",
    "settings.pushNotifications": "Notifications push",
    "settings.pushNotificationsDesc": "Recevez des notifications push du navigateur",
    "settings.weeklyReports": "Rapports de progrès hebdomadaires",
    "settings.weeklyReportsDesc": "Obtenez un résumé hebdomadaire de vos progrès d'apprentissage",
    "settings.marketingEmails": "E-mails marketing",
    "settings.marketingEmailsDesc": "Recevez des e-mails sur les nouvelles fonctionnalités et mises à jour",
    "settings.language": "Langue",
    "settings.timezone": "Fuseau horaire",
    "settings.privacy": "Confidentialité et sécurité",
    "settings.dataPrivacy": "Confidentialité des données",
    "settings.dataPrivacyDesc": "Vos données sont cryptées et stockées en toute sécurité",
    "settings.viewPrivacyPolicy": "Voir la politique de confidentialité",
    "settings.accountSecurity": "Sécurité du compte",
    "settings.accountSecurityDesc": "Gérez les paramètres de sécurité de votre compte",
    "settings.securitySettings": "Paramètres de sécurité",
    "settings.dangerZone": "Zone de danger",
    "settings.deleteAccount": "Supprimer le compte",
    "settings.deleteAccountDesc": "Supprimer définitivement votre compte et toutes les données associées",
    "settings.saveChanges": "Enregistrer les modifications",
    
    // Security Settings
    "security.title": "Paramètres de sécurité",
    "security.description": "Gérez la sécurité et la confidentialité de votre compte",
    "security.changePassword": "Changer le mot de passe",
    "security.currentPassword": "Mot de passe actuel",
    "security.newPassword": "Nouveau mot de passe",
    "security.confirmPassword": "Confirmer le mot de passe",
    "security.twoFactor": "Authentification à deux facteurs",
    "security.twoFactorDesc": "Ajoutez une couche supplémentaire de sécurité à votre compte",
    "security.enable2FA": "Activer 2FA",
    "security.activeSessions": "Sessions actives",
    "security.activeSessionsDesc": "Gérez les appareils actuellement connectés",
    "security.viewSessions": "Voir toutes les sessions",
    "security.loginHistory": "Historique de connexion",
    "security.loginHistoryDesc": "Voir votre activité de connexion récente",
    "security.viewHistory": "Voir l'historique",
    
    // Common
    "common.welcome": "Bon retour",
    "common.loading": "Chargement...",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.update": "Mettre à jour",
  },
  de: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.assessment": "Bewertung",
    "nav.recommendations": "Empfehlungen",
    "nav.progress": "Fortschritt",
    "nav.settings": "Einstellungen",
    "nav.profile": "Profil",
    "nav.logout": "Abmelden",
    
    // Settings
    "settings.title": "Einstellungen",
    "settings.description": "Verwalten Sie Ihr Konto und Ihre Einstellungen",
    "settings.appearance": "Erscheinungsbild",
    "settings.darkMode": "Dunkler Modus",
    "settings.darkModeDesc": "Zwischen hellem und dunklem Thema wechseln",
    "settings.notifications": "Benachrichtigungen",
    "settings.emailNotifications": "E-Mail-Benachrichtigungen",
    "settings.emailNotificationsDesc": "Erhalten Sie E-Mail-Updates über Ihre Kontaktivität",
    "settings.pushNotifications": "Push-Benachrichtigungen",
    "settings.pushNotificationsDesc": "Erhalten Sie Browser-Push-Benachrichtigungen",
    "settings.weeklyReports": "Wöchentliche Fortschrittsberichte",
    "settings.weeklyReportsDesc": "Erhalten Sie eine wöchentliche Zusammenfassung Ihres Lernfortschritts",
    "settings.marketingEmails": "Marketing-E-Mails",
    "settings.marketingEmailsDesc": "Erhalten Sie E-Mails über neue Funktionen und Updates",
    "settings.language": "Sprache",
    "settings.timezone": "Zeitzone",
    "settings.privacy": "Datenschutz und Sicherheit",
    "settings.dataPrivacy": "Datenschutz",
    "settings.dataPrivacyDesc": "Ihre Daten sind verschlüsselt und sicher gespeichert",
    "settings.viewPrivacyPolicy": "Datenschutzerklärung anzeigen",
    "settings.accountSecurity": "Kontosicherheit",
    "settings.accountSecurityDesc": "Verwalten Sie Ihre Kontosicherheitseinstellungen",
    "settings.securitySettings": "Sicherheitseinstellungen",
    "settings.dangerZone": "Gefahrenzone",
    "settings.deleteAccount": "Konto löschen",
    "settings.deleteAccountDesc": "Löschen Sie Ihr Konto und alle zugehörigen Daten dauerhaft",
    "settings.saveChanges": "Änderungen speichern",
    
    // Security Settings
    "security.title": "Sicherheitseinstellungen",
    "security.description": "Verwalten Sie Ihre Kontosicherheit und Privatsphäre",
    "security.changePassword": "Passwort ändern",
    "security.currentPassword": "Aktuelles Passwort",
    "security.newPassword": "Neues Passwort",
    "security.confirmPassword": "Passwort bestätigen",
    "security.twoFactor": "Zwei-Faktor-Authentifizierung",
    "security.twoFactorDesc": "Fügen Sie eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu",
    "security.enable2FA": "2FA aktivieren",
    "security.activeSessions": "Aktive Sitzungen",
    "security.activeSessionsDesc": "Verwalten Sie Geräte, die derzeit angemeldet sind",
    "security.viewSessions": "Alle Sitzungen anzeigen",
    "security.loginHistory": "Anmeldeverlauf",
    "security.loginHistoryDesc": "Zeigen Sie Ihre letzten Anmeldeaktivitäten an",
    "security.viewHistory": "Verlauf anzeigen",
    
    // Common
    "common.welcome": "Willkommen zurück",
    "common.loading": "Laden...",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.update": "Aktualisieren",
  },
  ar: {
    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.assessment": "التقييم",
    "nav.recommendations": "التوصيات",
    "nav.progress": "التقدم",
    "nav.settings": "الإعدادات",
    "nav.profile": "الملف الشخصي",
    "nav.logout": "تسجيل الخروج",
    
    // Settings
    "settings.title": "الإعدادات",
    "settings.description": "إدارة حسابك وتفضيلاتك",
    "settings.appearance": "المظهر",
    "settings.darkMode": "الوضع الداكن",
    "settings.darkModeDesc": "التبديل بين المظهر الفاتح والداكن",
    "settings.notifications": "الإشعارات",
    "settings.emailNotifications": "إشعارات البريد الإلكتروني",
    "settings.emailNotificationsDesc": "تلقي تحديثات البريد الإلكتروني حول نشاط حسابك",
    "settings.pushNotifications": "الإشعارات الفورية",
    "settings.pushNotificationsDesc": "تلقي إشعارات المتصفح الفورية",
    "settings.weeklyReports": "تقارير التقدم الأسبوعية",
    "settings.weeklyReportsDesc": "احصل على ملخص أسبوعي لتقدمك في التعلم",
    "settings.marketingEmails": "رسائل البريد الإلكتروني التسويقية",
    "settings.marketingEmailsDesc": "تلقي رسائل بريد إلكتروني حول الميزات والتحديثات الجديدة",
    "settings.language": "اللغة",
    "settings.timezone": "المنطقة الزمنية",
    "settings.privacy": "الخصوصية والأمان",
    "settings.dataPrivacy": "خصوصية البيانات",
    "settings.dataPrivacyDesc": "بياناتك مشفرة ومخزنة بأمان",
    "settings.viewPrivacyPolicy": "عرض سياسة الخصوصية",
    "settings.accountSecurity": "أمان الحساب",
    "settings.accountSecurityDesc": "إدارة إعدادات أمان حسابك",
    "settings.securitySettings": "إعدادات الأمان",
    "settings.dangerZone": "منطقة الخطر",
    "settings.deleteAccount": "حذف الحساب",
    "settings.deleteAccountDesc": "حذف حسابك وجميع البيانات المرتبطة به بشكل دائم",
    "settings.saveChanges": "حفظ التغييرات",
    
    // Security Settings
    "security.title": "إعدادات الأمان",
    "security.description": "إدارة أمان وخصوصية حسابك",
    "security.changePassword": "تغيير كلمة المرور",
    "security.currentPassword": "كلمة المرور الحالية",
    "security.newPassword": "كلمة المرور الجديدة",
    "security.confirmPassword": "تأكيد كلمة المرور",
    "security.twoFactor": "المصادقة الثنائية",
    "security.twoFactorDesc": "أضف طبقة إضافية من الأمان لحسابك",
    "security.enable2FA": "تفعيل المصادقة الثنائية",
    "security.activeSessions": "الجلسات النشطة",
    "security.activeSessionsDesc": "إدارة الأجهزة المتصلة حاليًا",
    "security.viewSessions": "عرض جميع الجلسات",
    "security.loginHistory": "سجل تسجيل الدخول",
    "security.loginHistoryDesc": "عرض نشاط تسجيل الدخول الأخير",
    "security.viewHistory": "عرض السجل",
    
    // Common
    "common.welcome": "مرحبًا بعودتك",
    "common.loading": "جاري التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.update": "تحديث",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    // Update HTML lang attribute
    document.documentElement.lang = lang
    // For RTL languages like Arabic
    if (lang === "ar") {
      document.documentElement.dir = "rtl"
    } else {
      document.documentElement.dir = "ltr"
    }
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

