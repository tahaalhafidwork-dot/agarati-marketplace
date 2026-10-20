import type { ReactNode } from "react"

import { AppNav } from "@/components/layout/app-nav"
import { Logo } from "@/components/layout/logo"

type AppShellProps = {
  title?: string
  items: readonly { href: string; label: string }[]
  homeHref?: string
  unreadCount?: number
  children: ReactNode
}

export function AppShell({
  title,
  items,
  unreadCount = 0,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 md:h-16 lg:max-w-7xl">
          <Logo />
          {title ? (
            <span className="hidden truncate text-sm font-medium text-muted-foreground lg:inline">
              {title}
            </span>
          ) : null}
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-3 lg:hidden">
          <AppNav items={items} unreadCount={unreadCount} />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 lg:max-w-7xl">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto border-e border-border bg-card/30 lg:block">
          <p className="px-4 pb-1 pt-4 text-[0.65rem] font-semibold tracking-wide text-muted-foreground">
            القائمة
          </p>
          <AppNav
            items={items}
            unreadCount={unreadCount}
            orientation="vertical"
          />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  )
}
