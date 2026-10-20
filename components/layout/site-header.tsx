"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ClipboardList, Heart, LogOut, MessageCircle, Plus, Search } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { UnreadBadge } from "@/components/layout/unread-badge"
import { useUnreadMessagesCount } from "@/components/layout/unread-messages-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { signOutAction } from "@/lib/actions/auth"
import {
  categoryMenuLabels,
  categorySlugs,
  type PropertyCategory,
} from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

function useSubHeaderMode(pathname: string) {
  return (
    pathname.startsWith("/categories") || pathname.startsWith("/properties")
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`
  }
  return name.slice(0, 1) || "?"
}

const iconBtn =
  "size-9 rounded-md text-[#f8f1e6]/90 hover:bg-white/[0.08] hover:text-[color:var(--brand-gold)]"

const HEADER_CATEGORIES = (
  Object.keys(categoryMenuLabels) as PropertyCategory[]
).map((key) => ({
  href: `/categories/${categorySlugs[key]}`,
  label: categoryMenuLabels[key],
}))

function HeaderSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      router.push("/properties")
      return
    }
    router.push(`/properties?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ms-4 hidden min-w-0 flex-1 items-center gap-1.5 lg:flex"
      role="search"
    >
      <label className="sr-only" htmlFor="header-search">
        بحث سريع
      </label>
      <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-md bg-white/[0.08] px-2.5 ring-1 ring-white/10 focus-within:ring-[color:var(--brand-gold)]/45">
        <Search
          className="size-3.5 shrink-0 text-[#f8f1e6]/55"
          strokeWidth={1.75}
        />
        <input
          id="header-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="رقم إعلان أو كلمات من العنوان…"
          className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#f8f1e6] outline-none placeholder:text-[#f8f1e6]/45"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-9 shrink-0 items-center rounded-md bg-[color:var(--brand-gold)]/15 px-3 text-xs font-semibold text-[color:var(--brand-gold)] ring-1 ring-[color:var(--brand-gold)]/40 transition hover:bg-[color:var(--brand-gold)]/22"
      >
        بحث
      </button>
    </form>
  )
}

export function SiteHeader({
  userName,
  unreadCount = 0,
  showAgencyUpgrade = false,
}: {
  userName?: string | null
  unreadCount?: number
  showAgencyUpgrade?: boolean
}) {
  const pathname = usePathname()
  const subMode = useSubHeaderMode(pathname)
  const signedIn = Boolean(userName)
  const liveUnread = useUnreadMessagesCount(unreadCount)
  const badgeCount = signedIn ? liveUnread : 0

  return (
    <header
      className={cn(
        "sticky top-0 z-40 text-[#f8f1e6]",
        "relative bg-[#0F2744]",
        "shadow-[0_8px_24px_-12px_rgba(15,39,68,0.45)]",
        subMode && "hidden md:block"
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,149,108,0.55)_20%,rgba(184,149,108,0.55)_80%,transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto flex h-12 w-full max-w-7xl items-center gap-1 px-2 md:h-14 md:px-4">
        <MobileNav
          userName={userName}
          showAgencyUpgrade={showAgencyUpgrade}
          triggerClassName="rounded-md text-[#f8f1e6]/90 hover:bg-white/[0.08] hover:text-[color:var(--brand-gold)]"
        />
        <Logo
          className="text-[#f8f1e6]"
          markClassName="rounded-md bg-[color:var(--brand-gold)]/15 text-[color:var(--brand-gold)] ring-1 ring-[color:var(--brand-gold)]/40"
          mutedClassName="text-[#f8f1e6]/55"
        />
        <HeaderSearch />
        <div className="ms-auto flex items-center gap-0.5">
          <Link
            href="/dashboard/favorites"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hidden sm:inline-flex",
              iconBtn
            )}
            aria-label="المفضلة"
          >
            <Heart className="size-4" strokeWidth={1.7} />
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard/property-requests"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hidden sm:inline-flex",
                iconBtn
              )}
              aria-label="طلبات العقار"
            >
              <ClipboardList className="size-4" strokeWidth={1.7} />
            </Link>
          ) : null}
          {signedIn ? (
            <>
              <Link
                href="/dashboard/messages"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "relative hidden max-w-[8rem] truncate rounded-md text-[#f8f1e6]/90 hover:bg-white/[0.08] hover:text-[color:var(--brand-gold)] sm:inline-flex"
                )}
              >
                الرسائل
                <UnreadBadge
                  count={badgeCount}
                  className="absolute -top-1 -end-1"
                />
              </Link>
              <Link
                href="/dashboard/messages"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "relative sm:hidden",
                  iconBtn
                )}
                aria-label={
                  badgeCount > 0
                    ? `الرسائل · ${badgeCount} جديدة`
                    : "الرسائل"
                }
              >
                <MessageCircle className="size-4" strokeWidth={1.7} />
                <UnreadBadge
                  count={badgeCount}
                  className="absolute top-0.5 end-0.5"
                />
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "ms-0.5 max-w-[9.5rem] gap-1.5 rounded-full pe-2.5 ps-1",
                  "text-[#f8f1e6]/95 hover:bg-white/[0.08] hover:text-[color:var(--brand-gold)]"
                )}
                aria-label={`حسابي · ${userName}`}
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-[color:var(--brand-gold)]/20 text-[0.65rem] font-semibold text-[color:var(--brand-gold)]">
                    {initials(userName!)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden truncate text-xs font-medium sm:inline">
                  {userName}
                </span>
              </Link>
              <form action={signOutAction} className="hidden md:block">
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-1.5 text-[#f8f1e6]/90 hover:bg-white/[0.08] hover:text-[color:var(--brand-gold)]"
                  )}
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="size-4" strokeWidth={1.7} />
                  <span className="text-xs font-medium">خروج</span>
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login?next=/dashboard/messages"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                iconBtn
              )}
              aria-label="الرسائل"
            >
              <MessageCircle className="size-4" strokeWidth={1.7} />
            </Link>
          )}
          <Link
            href="/dashboard/properties/new"
            className={cn(
              "ms-1.5 hidden h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold md:inline-flex",
              "bg-[color:var(--brand-gold)]/12 text-[color:var(--brand-gold)]",
              "ring-1 ring-[color:var(--brand-gold)]/45",
              "transition hover:bg-[color:var(--brand-gold)]/18 hover:ring-[color:var(--brand-gold)]/70"
            )}
          >
            <Plus className="size-4" strokeWidth={1.85} />
            أضف إعلاناً مجاناً
          </Link>
        </div>
      </div>

      <nav
        aria-label="تصنيفات سريعة"
        className="relative hidden border-t border-white/10 bg-[#0c2038] lg:block"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5">
          <span className="me-1 shrink-0 text-[0.65rem] font-medium text-[#f8f1e6]/45">
            التصنيفات
          </span>
          {HEADER_CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-[0.7rem] font-medium text-[#f8f1e6]/80",
                "transition hover:bg-white/[0.08] hover:text-[color:var(--brand-gold)]",
                pathname.startsWith(cat.href) &&
                  "bg-white/[0.1] text-[color:var(--brand-gold)]"
              )}
            >
              {cat.label}
            </Link>
          ))}
          <Link
            href="/categories"
            className="shrink-0 rounded-md px-2.5 py-1 text-[0.7rem] font-medium text-[color:var(--brand-gold)]/90 transition hover:bg-white/[0.08]"
          >
            الكل
          </Link>
        </div>
      </nav>
    </header>
  )
}
