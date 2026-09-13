import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { dashboardNav } from "@/lib/constants"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AppShell title="لوحة التحكم" items={dashboardNav} homeHref="/">
      {children}
    </AppShell>
  )
}
