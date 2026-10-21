import {
  NAV_CATALOG,
  toHrefLabel,
  type NavCatalogId,
  type NavItemDef,
} from "@/lib/navigation/catalog"

export { NAV_CATALOG, navEntry, toHrefLabel } from "@/lib/navigation/catalog"
export type {
  NavCatalogId,
  NavItemDef,
  NavIconKey,
} from "@/lib/navigation/catalog"

function pick(...ids: NavCatalogId[]): NavItemDef[] {
  return ids.map((id) => NAV_CATALOG[id])
}

function asLinks(items: NavItemDef[]) {
  return items.map(toHrefLabel)
}

/** Public top/footer browse strip */
export const publicNavSurface = asLinks(
  pick("home", "browse", "agencies")
) as readonly { href: string; label: string }[]

export const guestActionsSurface = [
  {
    href: NAV_CATALOG.login.href,
    label: NAV_CATALOG.login.labelAr,
    variant: "ghost" as const,
  },
  {
    href: NAV_CATALOG.register.href,
    label: NAV_CATALOG.register.labelAr,
    variant: "default" as const,
  },
] as const

export const footerBrowseSurface = asLinks(
  pick("browse", "agencies", "support", "contact")
) as readonly { href: string; label: string }[]

export const footerLegalSurface = asLinks(
  pick("privacy", "terms", "report")
) as readonly { href: string; label: string }[]

export const authUserMenuSurface = asLinks(
  pick(
    "dashboard",
    "messages",
    "favorites",
    "propertyRequests",
    "settings"
  )
) as readonly { href: string; label: string }[]

export const dashboardNavSurface = asLinks(
  pick(
    "dashboardOverview",
    "myProperties",
    "addProperty",
    "agencyDashboard",
    "agencyProjects",
    "messages",
    "favorites",
    "propertyRequests",
    "settings"
  )
) as readonly { href: string; label: string }[]

export type DashboardAgencyRole = "OWNER" | "AGENT" | null

/**
 * Dashboard navigation must reflect the authenticated agency membership.
 * Being an agency agent grants an agent workspace, not owner administration.
 */
export function dashboardNavForAgencyRole(
  role: DashboardAgencyRole
): { href: string; label: string }[] {
  const base = pick("dashboardOverview", "myProperties", "addProperty")
  const agency =
    role === "OWNER"
      ? pick("agencyDashboard", "agencyProjects")
      : []
  const remainder = pick(
    "messages",
    "favorites",
    "propertyRequests",
    "settings"
  )

  return asLinks([...base, ...agency, ...remainder])
}

export const adminNavSurface = asLinks(
  pick(
    "adminOverview",
    "adminProperties",
    "adminPropertyRequests",
    "adminUsers",
    "adminProjects",
    "adminPayments",
    "adminReports"
  )
) as readonly { href: string; label: string }[]

/** Mobile drawer core links (icons resolved in component). */
export const mobileDrawerCoreIds = [
  "propertyRequestsDrawer",
  "settings",
  "privacy",
  "terms",
  "support",
] as const satisfies readonly NavCatalogId[]

export const mobileDrawerCoreSurface = mobileDrawerCoreIds.map(
  (id) => NAV_CATALOG[id]
)

export type MobileBottomTabDef = {
  id: NavCatalogId
  href: string
  label: string
  primary?: boolean
  account?: boolean
  matchPrefixes: string[]
}

export function mobileBottomTabsSurface(
  signedIn: boolean
): MobileBottomTabDef[] {
  return [
    {
      id: "agarly",
      href: NAV_CATALOG.agarly.href,
      label: NAV_CATALOG.agarly.labelAr,
      matchPrefixes: ["/agarly", "/basira"],
    },
    {
      id: "projects",
      href: NAV_CATALOG.projects.href,
      label: NAV_CATALOG.projects.labelAr,
      matchPrefixes: ["/projects"],
    },
    {
      id: "addListing",
      href: NAV_CATALOG.addListing.href,
      label: NAV_CATALOG.addListing.labelAr,
      primary: true,
      matchPrefixes: ["/dashboard/properties/new"],
    },
    {
      id: "services",
      href: NAV_CATALOG.services.href,
      label: NAV_CATALOG.services.labelAr,
      matchPrefixes: [
        "/services",
        "/agencies",
        "/contact",
        "/support",
        "/dashboard/property-requests",
      ],
    },
    {
      id: "account",
      href: signedIn
        ? NAV_CATALOG.account.href
        : `/login?next=${encodeURIComponent(NAV_CATALOG.account.href)}`,
      label: NAV_CATALOG.account.labelAr,
      account: true,
      matchPrefixes: ["/login", "/register", "/dashboard", "/admin"],
    },
  ]
}

export const surfaces = {
  publicNav: publicNavSurface,
  guestActions: guestActionsSurface,
  footerBrowse: footerBrowseSurface,
  footerLegal: footerLegalSurface,
  authUserMenu: authUserMenuSurface,
  dashboardNav: dashboardNavSurface,
  adminNav: adminNavSurface,
  mobileDrawerCore: mobileDrawerCoreSurface,
  mobileBottomTabs: mobileBottomTabsSurface,
} as const
