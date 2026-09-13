import type { ReactNode } from "react"
import Link from "next/link"

import { AppNav } from "@/components/layout/app-nav"
import { Logo } from "@/components/layout/logo"

type AppShellProps = {
  title: string
  items: readonly { href: string; label: string }[]
  homeHref: string
  children: ReactNode
}

export function AppShell({ title, items, homeHref, children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 md:h-16">
          <Logo />
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">{title}</p>
            <Link
              href={homeHref}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              الموقع
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-3">
          <AppNav items={items} />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
