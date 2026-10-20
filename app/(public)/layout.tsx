import type { ReactNode } from "react"

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { UnreadMessagesProvider } from "@/components/layout/unread-messages-provider"
import { GuestFavoritesSync } from "@/components/favorites/guest-favorites-sync"
import { getSessionUser } from "@/lib/auth"

export default async function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getSessionUser()
  // Unread is loaded client-side — keeps public TTFB free of 2 COUNT queries.
  const unreadCount = 0
  const signedIn = Boolean(user)
  const showAgencyUpgrade = Boolean(
    user &&
      user.accountType !== "AGENCY" &&
      user.agencyUpgradeStatus !== "APPROVED" &&
      user.agencyUpgradeStatus !== "PENDING"
  )

  return (
    <UnreadMessagesProvider
      enabled={signedIn}
      initialCount={unreadCount}
    >
      <div className="flex min-h-full flex-1 flex-col">
        <GuestFavoritesSync enabled={signedIn} />
        <SiteHeader
          userName={user?.name}
          unreadCount={unreadCount}
          showAgencyUpgrade={showAgencyUpgrade}
        />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <div className="hidden md:block">
          <SiteFooter />
        </div>
        <MobileBottomNav signedIn={signedIn} unreadCount={unreadCount} />
      </div>
    </UnreadMessagesProvider>
  )
}
