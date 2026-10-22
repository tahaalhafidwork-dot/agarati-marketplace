import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { ensureBootstrapAdmin } from "@/lib/admin-service"
import { adminNav } from "@/lib/constants"

/** Auth-gated admin UI must not prerender against DB at build time (Vercel / offline local DB). */
export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await ensureBootstrapAdmin()

  if (!session) {
    return (
      <AppShell title="الإدارة" items={adminNav} homeHref="/">
        <p className="text-sm text-destructive">
          يجب تسجيل الدخول لعرض لوحة الإدارة.
        </p>
      </AppShell>
    )
  }

  if (session.role !== "ADMIN") {
    return (
      <AppShell title="الإدارة" items={adminNav} homeHref="/">
        <p className="text-sm text-destructive">
          هذه الصفحة للمسؤولين فقط.
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell title="الإدارة" items={adminNav} homeHref="/">
      {children}
    </AppShell>
  )
}
