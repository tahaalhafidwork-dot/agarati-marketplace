"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { UnreadBadge } from "@/components/layout/unread-badge"
import { useUnreadMessagesCount } from "@/components/layout/unread-messages-provider"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
}

export function AppNav({
  items,
  unreadCount = 0,
  orientation = "horizontal",
}: {
  items: readonly NavItem[]
  unreadCount?: number
  orientation?: "horizontal" | "vertical"
}) {
  const pathname = usePathname()
  const liveUnread = useUnreadMessagesCount(unreadCount)
  const vertical = orientation === "vertical"

  // Longest matching href wins so /dashboard/properties/new does not
  // also highlight /dashboard/properties.
  const activeHref = resolveActiveHref(pathname, items.map((i) => i.href))

  return (
    <nav
      className={cn(
        vertical
          ? "flex flex-col gap-0.5 p-2"
          : "-mx-4 flex gap-1 overflow-x-auto px-4 pb-px"
      )}
      aria-label={vertical ? "قائمة اللوحة" : undefined}
    >
      {items.map((item) => {
        const active = item.href === activeHref
        const showBadge =
          item.href === "/dashboard/messages" && liveUnread > 0

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-1.5 font-medium transition-colors",
              vertical
                ? "rounded-lg px-3 py-2 text-sm"
                : "shrink-0 rounded-lg px-3 py-1.5 text-sm",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
            {showBadge ? <UnreadBadge count={liveUnread} /> : null}
          </Link>
        )
      })}
    </nav>
  )
}

function resolveActiveHref(
  pathname: string,
  hrefs: readonly string[]
): string | null {
  let best: string | null = null
  for (const href of hrefs) {
    const exact = pathname === href
    const nested =
      href !== "/dashboard" &&
      href !== "/admin" &&
      pathname.startsWith(`${href}/`)
    if (!exact && !nested) continue
    if (!best || href.length > best.length) best = href
  }
  return best
}
