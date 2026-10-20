"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ClipboardList,
  FileText,
  Heart,
  LifeBuoy,
  LogOut,
  Menu,
  Plus,
  Send,
  Settings,
  Shield,
} from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { signOutAction } from "@/lib/actions/auth"
import { guestActions } from "@/lib/constants"
import { NAV_CATALOG, mobileDrawerCoreSurface } from "@/lib/navigation"
import { cn } from "@/lib/utils"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`
  }
  return name.slice(0, 1) || "?"
}

const drawerIconById = {
  propertyRequestsDrawer: ClipboardList,
  settings: Settings,
  privacy: Shield,
  terms: FileText,
  support: LifeBuoy,
} as const

const drawerLinks = mobileDrawerCoreSurface.map((item) => ({
  href: item.href,
  label: item.labelAr,
  icon: drawerIconById[item.id as keyof typeof drawerIconById],
}))

/** Account / support drawer — categories live on home + search, not here. */
export function MobileNav({
  triggerClassName,
  userName,
  showAgencyUpgrade,
}: {
  triggerClassName?: string
  userName?: string | null
  /** Individual account that can still request commercial agency upgrade. */
  showAgencyUpgrade?: boolean
}) {
  const [open, setOpen] = useState(false)
  const signedIn = Boolean(userName)

  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-9 shrink-0", triggerClassName)}
          />
        }
      >
        <Menu className="size-5" />
        <span className="sr-only">فتح القائمة</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm gap-0 bg-card p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="sr-only">القائمة</SheetTitle>
          <Logo />
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="space-y-3 px-4 py-4">
            {signedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={close}
                  className="flex items-center gap-3 rounded-xl border border-border bg-[#faf6ef]/70 px-3 py-2.5 transition hover:bg-[#f3ebe0]"
                >
                  <Avatar size="default">
                    <AvatarFallback className="bg-[#0F2744] text-[color:var(--brand-gold)]">
                      {initials(userName!)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#0F2744]">
                      {userName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      حسابي
                    </span>
                  </span>
                  <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                </Link>
                {showAgencyUpgrade ? (
                  <Link
                    href="/dashboard/settings?focus=account-type"
                    onClick={close}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "w-full gap-1.5"
                    )}
                  >
                    <Send className="size-3.5" />
                    طلب الترقية
                  </Link>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {guestActions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={buttonVariants({ variant: item.variant })}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <nav className="flex flex-col py-1" aria-label="القائمة">
            {drawerLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0F2744] transition hover:bg-[#faf6ef]/80"
                >
                  <Icon
                    className="size-4 shrink-0 text-[color:var(--brand-gold)]"
                    strokeWidth={1.75}
                  />
                  <span className="flex-1">{item.label}</span>
                  <ChevronLeft className="size-4 shrink-0 text-muted-foreground/50" />
                </Link>
              )
            })}
          </nav>

          <Separator />

          <div className="flex flex-col gap-2 px-4 py-4">
            <Link
              href={NAV_CATALOG.addListingFree.href}
              onClick={close}
              className={buttonVariants()}
            >
              <Plus className="size-4" />
              {NAV_CATALOG.addListingFree.labelAr}
            </Link>
            <Link
              href={NAV_CATALOG.favorites.href}
              onClick={close}
              className={buttonVariants({ variant: "outline" })}
            >
              <Heart className="size-4" />
              {NAV_CATALOG.favorites.labelAr}
            </Link>
          </div>

          {signedIn ? (
            <>
              <Separator />
              <div className="px-4 py-4">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    onClick={close}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    )}
                  >
                    <LogOut className="size-4" />
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
