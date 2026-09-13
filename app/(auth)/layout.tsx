import type { ReactNode } from "react"

import { Logo } from "@/components/layout/logo"

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-14 items-center border-b px-4 md:h-16">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
