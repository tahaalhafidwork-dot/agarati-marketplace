import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { UnreadMessagesProvider } from "@/components/layout/unread-messages-provider"
import { GuestFavoritesSync } from "@/components/favorites/guest-favorites-sync"
import { getActiveAgencyMembership } from "@/lib/agency-service"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/db"
import { dashboardNavForAgencyRole } from "@/lib/navigation"

/** Session-aware dashboard must not prerender against DB at build time. */
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getSessionUser()
  let agencyRole: "OWNER" | "AGENT" | null = null
  if (user && isDatabaseConfigured()) {
    try {
      const membership = await getActiveAgencyMembership(user.id)
      agencyRole = membership?.role ?? null
    } catch {
      // Fail closed: a failed membership lookup must not expose owner UI.
      agencyRole = null
    }
  }
  const dashboardItems = dashboardNavForAgencyRole(agencyRole)
  // Badge fills via client provider — avoid COUNT on every dashboard RSC.
  const unreadCount = 0

  return (
    <UnreadMessagesProvider
      enabled={Boolean(user)}
      initialCount={unreadCount}
    >
      <GuestFavoritesSync enabled={Boolean(user)} />
      <AppShell
        title="لوحة التحكم"
        items={dashboardItems}
        homeHref="/"
        unreadCount={unreadCount}
      >
        {children}
      </AppShell>
    </UnreadMessagesProvider>
  )
}
