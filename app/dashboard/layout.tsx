import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { UnreadMessagesProvider } from "@/components/layout/unread-messages-provider"
import { GuestFavoritesSync } from "@/components/favorites/guest-favorites-sync"
import { getSessionUser } from "@/lib/auth"
import { dashboardNav } from "@/lib/constants"

/** Session-aware dashboard must not prerender against DB at build time. */
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getSessionUser()
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
        items={dashboardNav}
        homeHref="/"
        unreadCount={unreadCount}
      >
        {children}
      </AppShell>
    </UnreadMessagesProvider>
  )
}
