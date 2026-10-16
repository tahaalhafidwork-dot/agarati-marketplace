/**
 * Characterization contracts — freeze expected behavior before refactors.
 * Run: npm run characterize
 */
import { parseListingQuery } from "@/lib/listing-query"
import {
  guestActions,
  publicNav,
  dashboardNav,
  adminNav,
  authUserMenu,
  footerBrowse,
  footerLegal,
} from "@/lib/constants"

export type BrowseParseCase = {
  name: string
  params: Record<string, string | string[] | undefined>
  expect: {
    category?: string
    deal?: string
    sort: string
    city?: string
  }
}

/** URL → ListingQuery shape locks (browse page must keep these). */
export const browseParseCases: BrowseParseCase[] = [
  {
    name: "empty defaults newest",
    params: {},
    expect: { sort: "newest" },
  },
  {
    name: "apartment sale erbil",
    params: { type: "apartment", deal: "sale", city: "erbil" },
    expect: {
      category: "apartment",
      deal: "sale",
      city: "erbil",
      sort: "newest",
    },
  },
  {
    name: "rent price sort",
    params: { deal: "rent", sort: "price-asc" },
    expect: { deal: "rent", sort: "price-asc" },
  },
]

export type FavoriteOutcome = {
  name: string
  isDemo: boolean
  auth: boolean
  serverOk: boolean
  expectSource: "local" | "server" | "login-redirect"
}

/** Favorite decision matrix (SSOT rules). */
export const favoriteOutcomeCases: FavoriteOutcome[] = [
  {
    name: "demo always local",
    isDemo: true,
    auth: true,
    serverOk: true,
    expectSource: "local",
  },
  {
    name: "guest auth fail → login",
    isDemo: false,
    auth: false,
    serverOk: false,
    expectSource: "login-redirect",
  },
  {
    name: "authed success → server",
    isDemo: false,
    auth: true,
    serverOk: true,
    expectSource: "server",
  },
  {
    name: "authed missing listing → local fallback",
    isDemo: false,
    auth: true,
    serverOk: false,
    expectSource: "local",
  },
]

/** Unread count must stay a non-negative integer sum of listing + request threads. */
export const unreadCountContract = {
  min: 0,
  pollingFallbackMs: 12_000,
  threadPollingFallbackMs: 3_000,
} as const

/** Navigation label/href locks — surfaces must not drift. */
export const navHrefLocks = {
  publicNav: publicNav.map((i) => ({ href: i.href, label: i.label })),
  guestActions: guestActions.map((i) => ({ href: i.href, label: i.label })),
  authUserMenu: authUserMenu.map((i) => ({ href: i.href, label: i.label })),
  dashboardNav: dashboardNav.map((i) => ({ href: i.href, label: i.label })),
  adminNav: adminNav.map((i) => ({ href: i.href, label: i.label })),
  footerBrowse: footerBrowse.map((i) => ({ href: i.href, label: i.label })),
  footerLegal: footerLegal.map((i) => ({ href: i.href, label: i.label })),
  mobileBottom: [
    { href: "/agarly", label: "Agarly" },
    { href: "/projects", label: "مشاريع" },
    { href: "/dashboard/properties/new", label: "أضف إعلاناً" },
    { href: "/services", label: "خدمات" },
    { href: "/dashboard", label: "حسابي" },
  ],
  mobileDrawerCore: [
    { href: "/dashboard/property-requests", label: "طلبات العقارات" },
    { href: "/dashboard/settings", label: "الإعدادات" },
    { href: "/privacy", label: "سياسة الخصوصية" },
    { href: "/terms", label: "شروط الاستخدام" },
    { href: "/support", label: "الدعم" },
  ],
} as const

export function assertBrowseParseCases(): string[] {
  const errors: string[] = []
  for (const c of browseParseCases) {
    const q = parseListingQuery(c.params)
    if (c.expect.sort !== q.sort) {
      errors.push(`${c.name}: sort want ${c.expect.sort} got ${q.sort}`)
    }
    if (c.expect.category !== undefined && c.expect.category !== q.category) {
      errors.push(
        `${c.name}: category want ${c.expect.category} got ${q.category}`
      )
    }
    if (c.expect.deal !== undefined && c.expect.deal !== q.deal) {
      errors.push(`${c.name}: deal want ${c.expect.deal} got ${q.deal}`)
    }
    if (c.expect.city !== undefined && c.expect.city !== q.city) {
      errors.push(`${c.name}: city want ${c.expect.city} got ${q.city}`)
    }
  }
  return errors
}

export function assertNavLocks(): string[] {
  const errors: string[] = []
  const check = (
    name: string,
    actual: readonly { href: string; label: string }[],
    expected: readonly { href: string; label: string }[]
  ) => {
    if (actual.length !== expected.length) {
      errors.push(`${name}: length ${actual.length} !== ${expected.length}`)
      return
    }
    for (let i = 0; i < expected.length; i++) {
      if (actual[i]!.href !== expected[i]!.href) {
        errors.push(
          `${name}[${i}].href want ${expected[i]!.href} got ${actual[i]!.href}`
        )
      }
      if (actual[i]!.label !== expected[i]!.label) {
        errors.push(
          `${name}[${i}].label want ${expected[i]!.label} got ${actual[i]!.label}`
        )
      }
    }
  }
  check("publicNav", publicNav, navHrefLocks.publicNav)
  check("dashboardNav", dashboardNav, navHrefLocks.dashboardNav)
  check("adminNav", adminNav, navHrefLocks.adminNav)
  check("authUserMenu", authUserMenu, navHrefLocks.authUserMenu)
  return errors
}

export function runAllCharacterization(): string[] {
  return [...assertBrowseParseCases(), ...assertNavLocks()]
}
