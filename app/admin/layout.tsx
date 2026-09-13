import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { adminNav } from "@/lib/constants"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AppShell title="الإدارة" items={adminNav} homeHref="/">
      {children}
    </AppShell>
  )
}
