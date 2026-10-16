import type { ReactNode } from "react"

import { Logo } from "@/components/layout/logo"

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted">
      <header className="flex h-12 items-center border-b border-border bg-card px-4 md:h-14">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
