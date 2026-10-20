import type { Metadata } from "next"
import Link from "next/link"

import { ModerationNote } from "@/components/admin"
import { DashboardStat } from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import {
  ensureBootstrapAdmin,
  fetchAdminOverviewStats,
} from "@/lib/admin-service"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "الإدارة",
}

export default async function AdminOverviewPage() {
  const session = await ensureBootstrapAdmin()
  const stats = await fetchAdminOverviewStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#0F2744]">نظرة عامة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          لوحة مشرف للمنصة
          {session ? ` · ${session.name}` : ""}
          {session?.role === "ADMIN" ? " · صلاحية ADMIN" : ""}
        </p>
      </div>

      {!stats.dbReady ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          قاعدة البيانات غير متصلة — راجع docs/SUPABASE_SETUP.md
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DashboardStat
          label="بانتظار المراجعة"
          value={String(stats.pending)}
        />
        <DashboardStat label="منشور" value={String(stats.active)} />
        <DashboardStat label="مرفوض" value={String(stats.rejected)} />
        <DashboardStat label="مستخدمون" value={String(stats.users)} />
      </div>

      <p className="text-xs text-muted-foreground">
        طابور الانتظار: {stats.pendingListings} إعلان ·{" "}
        {stats.pendingRequests} طلب عقار
      </p>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/properties"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          مراجعة العقارات
        </Link>
        <Link
          href="/admin/property-requests"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          مراجعة طلبات العقار
        </Link>
        <Link
          href="/admin/projects"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          مراجعة المشاريع
        </Link>
        <Link
          href="/admin/users"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          المستخدمون
        </Link>
      </div>

      <p className="rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        عيّنات الواجهة العامة: {stats.demoSampleCount} إعلان تجريبي (ليست في
        طابور المراجعة إلا إذا نُشرت من حساب حقيقي).
      </p>

      <ModerationNote />
    </div>
  )
}
