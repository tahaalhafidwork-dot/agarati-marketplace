/**
 * Single source of truth for site navigation labels/hrefs.
 * Surfaces select subsets — do not duplicate href/label elsewhere.
 */

export type NavIconKey =
  | "home"
  | "search"
  | "plus"
  | "building"
  | "user"
  | "sparkles"
  | "heart"
  | "messages"
  | "clipboard"
  | "settings"
  | "shield"
  | "file"
  | "lifeBuoy"
  | "none"

export type NavItemDef = {
  id: string
  href: string
  labelAr: string
  iconKey?: NavIconKey
  /** Requires authenticated session to show meaningfully */
  auth?: "required" | "guest-only" | "any"
  badge?: "unread-messages"
}

export const NAV_CATALOG = {
  home: {
    id: "home",
    href: "/",
    labelAr: "الرئيسية",
    iconKey: "home",
    auth: "any",
  },
  browse: {
    id: "browse",
    href: "/properties",
    labelAr: "تصفح العقارات",
    iconKey: "search",
    auth: "any",
  },
  agencies: {
    id: "agencies",
    href: "/agencies",
    labelAr: "المكاتب العقارية",
    iconKey: "building",
    auth: "any",
  },
  categories: {
    id: "categories",
    href: "/categories",
    labelAr: "بحث",
    iconKey: "search",
    auth: "any",
  },
  projects: {
    id: "projects",
    href: "/projects",
    labelAr: "مشاريع",
    iconKey: "building",
    auth: "any",
  },
  agarly: {
    id: "agarly",
    href: "/agarly",
    labelAr: "Agarly",
    iconKey: "sparkles",
    auth: "any",
  },
  addListing: {
    id: "addListing",
    href: "/dashboard/properties/new",
    labelAr: "أضف إعلاناً",
    iconKey: "plus",
    auth: "any",
  },
  addListingFree: {
    id: "addListingFree",
    href: "/dashboard/properties/new",
    labelAr: "أضف إعلاناً مجاناً",
    iconKey: "plus",
    auth: "any",
  },
  services: {
    id: "services",
    href: "/services",
    labelAr: "خدمات",
    iconKey: "building",
    auth: "any",
  },
  account: {
    id: "account",
    href: "/dashboard",
    labelAr: "حسابي",
    iconKey: "user",
    auth: "any",
    badge: "unread-messages",
  },
  login: {
    id: "login",
    href: "/login",
    labelAr: "تسجيل الدخول",
    auth: "guest-only",
  },
  register: {
    id: "register",
    href: "/register",
    labelAr: "إنشاء حساب",
    auth: "guest-only",
  },
  dashboard: {
    id: "dashboard",
    href: "/dashboard",
    labelAr: "لوحة التحكم",
    auth: "required",
  },
  dashboardOverview: {
    id: "dashboardOverview",
    href: "/dashboard",
    labelAr: "نظرة عامة",
    auth: "required",
  },
  myProperties: {
    id: "myProperties",
    href: "/dashboard/properties",
    labelAr: "عقاراتي",
    auth: "required",
  },
  addProperty: {
    id: "addProperty",
    href: "/dashboard/properties/new",
    labelAr: "إضافة عقار",
    auth: "required",
  },
  messages: {
    id: "messages",
    href: "/dashboard/messages",
    labelAr: "الرسائل",
    iconKey: "messages",
    auth: "required",
    badge: "unread-messages",
  },
  favorites: {
    id: "favorites",
    href: "/dashboard/favorites",
    labelAr: "المفضلة",
    iconKey: "heart",
    auth: "any",
  },
  propertyRequests: {
    id: "propertyRequests",
    href: "/dashboard/property-requests",
    labelAr: "طلبات العقار",
    iconKey: "clipboard",
    auth: "required",
  },
  /** Drawer wording (plural) — same href as propertyRequests */
  propertyRequestsDrawer: {
    id: "propertyRequestsDrawer",
    href: "/dashboard/property-requests",
    labelAr: "طلبات العقارات",
    iconKey: "clipboard",
    auth: "any",
  },
  settings: {
    id: "settings",
    href: "/dashboard/settings",
    labelAr: "الإعدادات",
    iconKey: "settings",
    auth: "any",
  },
  agencyProjects: {
    id: "agencyProjects",
    href: "/dashboard/agency-projects",
    labelAr: "المشاريع السكنية",
    iconKey: "clipboard",
    auth: "required",
  },
  agencyDashboard: {
    id: "agencyDashboard",
    href: "/dashboard/agency",
    labelAr: "لوحة الوكالة",
    iconKey: "building",
    auth: "required",
  },
  support: {
    id: "support",
    href: "/support",
    labelAr: "الدعم",
    iconKey: "lifeBuoy",
    auth: "any",
  },
  contact: {
    id: "contact",
    href: "/contact",
    labelAr: "تواصل معنا",
    auth: "any",
  },
  privacy: {
    id: "privacy",
    href: "/privacy",
    labelAr: "سياسة الخصوصية",
    iconKey: "shield",
    auth: "any",
  },
  terms: {
    id: "terms",
    href: "/terms",
    labelAr: "شروط الاستخدام",
    iconKey: "file",
    auth: "any",
  },
  report: {
    id: "report",
    href: "/support/report",
    labelAr: "تقديم بلاغ",
    auth: "any",
  },
  adminOverview: {
    id: "adminOverview",
    href: "/admin",
    labelAr: "نظرة عامة",
    auth: "required",
  },
  adminProperties: {
    id: "adminProperties",
    href: "/admin/properties",
    labelAr: "العقارات",
    auth: "required",
  },
  adminPropertyRequests: {
    id: "adminPropertyRequests",
    href: "/admin/property-requests",
    labelAr: "طلبات العقار",
    auth: "required",
  },
  adminUsers: {
    id: "adminUsers",
    href: "/admin/users",
    labelAr: "المستخدمون",
    auth: "required",
  },
  adminProjects: {
    id: "adminProjects",
    href: "/admin/projects",
    labelAr: "المشاريع",
    auth: "required",
  },
  adminReports: {
    id: "adminReports",
    href: "/admin/reports",
    labelAr: "البلاغات",
    auth: "required",
  },
  adminPayments: {
    id: "adminPayments",
    href: "/admin/payments",
    labelAr: "طلبات الدفع",
    auth: "required",
  },
} as const satisfies Record<string, NavItemDef>

export type NavCatalogId = keyof typeof NAV_CATALOG

export function navEntry(id: NavCatalogId): NavItemDef {
  return NAV_CATALOG[id]
}

export function toHrefLabel(item: NavItemDef): { href: string; label: string } {
  return { href: item.href, label: item.labelAr }
}
