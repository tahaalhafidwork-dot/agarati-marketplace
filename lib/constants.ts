export const SITE_NAME_AR = "أغاراتي"
export const SITE_NAME_LATIN = "AGARATİ"
export const PAGE_SIZE = 24

export const publicNav = [
  { href: "/", label: "الرئيسية" },
  { href: "/properties", label: "العقارات" },
  { href: "/agencies", label: "الوكالات" },
] as const

export const guestActions = [
  { href: "/login", label: "دخول", variant: "ghost" as const },
  { href: "/register", label: "إنشاء حساب", variant: "default" as const },
] as const

export const footerLegal = [
  { href: "/privacy", label: "خصوصية" },
  { href: "/terms", label: "شروط" },
  { href: "/contact", label: "تواصل" },
] as const

/** Authenticated header menu — no chat/messages links. */
export const authUserMenu = [
  { href: "/dashboard", label: "لوحة التحكم" },
  { href: "/dashboard/favorites", label: "المفضلة" },
  { href: "/dashboard/contact-leads", label: "طلبات التواصل" },
  { href: "/dashboard/settings", label: "الإعدادات" },
] as const

export const dashboardNav = [
  { href: "/dashboard", label: "نظرة عامة" },
  { href: "/dashboard/properties", label: "عقاراتي" },
  { href: "/dashboard/properties/new", label: "إضافة عقار" },
  { href: "/dashboard/favorites", label: "المفضلة" },
  { href: "/dashboard/contact-leads", label: "طلبات التواصل" },
  { href: "/dashboard/settings", label: "الإعدادات" },
] as const

export const adminNav = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/properties", label: "العقارات" },
  { href: "/admin/users", label: "المستخدمون" },
  { href: "/admin/reports", label: "البلاغات" },
] as const
