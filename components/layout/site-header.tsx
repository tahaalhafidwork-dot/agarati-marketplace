"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { AuthUserMenu } from "@/components/layout/auth-user-menu"
import { Logo } from "@/components/layout/logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { buttonVariants } from "@/components/ui/button"
import { authStub } from "@/features/auth"
import { guestActions, publicNav } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-backdrop-filter:backdrop-blur-md md:h-16">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-3 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto hidden items-center gap-2 md:flex">
          {authStub.isAuthenticated && authStub.user ? (
            <AuthUserMenu user={authStub.user} />
          ) : (
            guestActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={buttonVariants({ variant: item.variant })}
              >
                {item.label}
              </Link>
            ))
          )}
        </div>
        <div className="ms-auto md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
