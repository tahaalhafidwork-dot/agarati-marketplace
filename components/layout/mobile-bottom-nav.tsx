"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Landmark, Plus, Sparkles, UserRound } from "lucide-react"

import { UnreadBadge } from "@/components/layout/unread-badge"
import { useUnreadMessagesCount } from "@/components/layout/unread-messages-provider"
import { mobileBottomTabsSurface } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const iconById = {
  agarly: Sparkles,
  projects: Landmark,
  addListing: Plus,
  services: Building2,
  account: UserRound,
} as const

/** Bottom tabs — quiet navy/gold chrome aligned with prestige category marks. */
export function MobileBottomNav({
  signedIn = false,
  unreadCount = 0,
}: {
  signedIn?: boolean
  unreadCount?: number
}) {
  const pathname = usePathname()
  const tabs = mobileBottomTabsSurface(signedIn)
  const liveUnread = useUnreadMessagesCount(unreadCount)
  const badgeCount = signedIn ? liveUnread : 0

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "border-t border-[#0F2744]/08 bg-[#fffdf9]/95",
        "pb-[env(safe-area-inset-bottom)]",
        "shadow-[0_-10px_28px_-16px_rgba(15,39,68,0.28)]",
        "backdrop-blur-md"
      )}
      aria-label="التنقل السفلي"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,149,108,0.5)_18%,rgba(184,149,108,0.5)_82%,transparent)]"
        aria-hidden
      />
      <ul className="relative mx-auto grid h-[3.6rem] max-w-7xl grid-cols-5">
        {tabs.map((tab) => {
          const active = tab.matchPrefixes.some((p) => pathname.startsWith(p))
          const Icon = iconById[tab.id as keyof typeof iconById]
          const showAccountBadge =
            Boolean(tab.account) && signedIn && badgeCount > 0

          if (tab.primary) {
            return (
              <li key={tab.id} className="flex items-center justify-center">
                <Link
                  href={tab.href}
                  className="flex -translate-y-2.5 flex-col items-center gap-0.5"
                >
                  <span
                    className={cn(
                      "relative inline-flex size-12 items-center justify-center overflow-hidden rounded-full",
                      "bg-[#0F2744] text-[color:var(--brand-gold)]",
                      "ring-1 ring-[color:var(--brand-gold)]/55",
                      "shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_10px_20px_-10px_rgba(15,39,68,0.55)]"
                    )}
                  >
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent"
                      aria-hidden
                    />
                    <Icon className="relative size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-[0.62rem] font-medium text-[#0F2744]/75">
                    {tab.label}
                  </span>
                </Link>
              </li>
            )
          }

          return (
            <li key={tab.id} className="flex">
              <Link
                href={tab.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.62rem] transition-colors",
                  active
                    ? "font-semibold text-[#0F2744]"
                    : "font-medium text-[#6B6560] hover:text-[#0F2744]/80"
                )}
              >
                <span className="relative inline-flex">
                  <Icon
                    className={cn(
                      "size-[1.2rem]",
                      active
                        ? "text-[color:var(--brand-gold)]"
                        : "text-[#6B6560]"
                    )}
                    strokeWidth={active ? 1.85 : 1.6}
                  />
                  {showAccountBadge ? (
                    <UnreadBadge
                      count={badgeCount}
                      className="absolute -top-1.5 -end-2.5"
                    />
                  ) : null}
                </span>
                {tab.label}
                {active ? (
                  <span
                    className="mt-0.5 h-0.5 w-4 rounded-full bg-[color:var(--brand-gold)]/70"
                    aria-hidden
                  />
                ) : (
                  <span className="mt-0.5 h-0.5 w-4" aria-hidden />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
