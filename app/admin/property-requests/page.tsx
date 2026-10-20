import type { Metadata } from "next"
import Link from "next/link"

import { AdminPropertyRequestsManageList } from "@/components/admin/admin-property-requests-manage-list"
import { buttonVariants } from "@/components/ui/button"
import { ensureBootstrapAdmin } from "@/lib/admin-service"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import {
  formatAreaRange,
  formatBudgetRange,
} from "@/lib/property-requests"
import { prismaToCategory, prismaToDeal } from "@/lib/listings"
import { formatPublicArea, getCity } from "@/lib/locations"
import { categoryLabels, dealLabels } from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "مراجعة طلبات العقار",
}

export default async function AdminPropertyRequestsPage() {
  const session = await ensureBootstrapAdmin()

  if (!session) {
    return (
      <p className="text-sm text-destructive">
        يجب تسجيل الدخول لعرض طابور مراجعة الطلبات.
      </p>
    )
  }

  if (session.role !== "ADMIN") {
    return (
      <p className="text-sm text-destructive">
        هذه الصفحة للمسؤولين فقط.
      </p>
    )
  }

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        قاعدة البيانات غير مُعدّة — docs/SUPABASE_SETUP.md
      </p>
    )
  }

  const rows = await prisma.propertyRequest.findMany({
    where: {
      status: { in: ["PENDING", "OPEN", "REJECTED", "FULFILLED", "CLOSED"] },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    include: {
      user: { select: { name: true, email: true, phone: true } },
    },
  })

  const sorted = [...rows].sort((a, b) => {
    const rank = (s: string) =>
      s === "PENDING" ? 0 : s === "OPEN" ? 1 : s === "REJECTED" ? 2 : 3
    const d = rank(a.status) - rank(b.status)
    if (d !== 0) return d
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const pendingCount = rows.filter((r) => r.status === "PENDING").length

  const requests = sorted.map((row) => {
    const category = row.category
      ? categoryLabels[prismaToCategory[row.category]]
      : null
    const deal = row.deal ? dealLabels[prismaToDeal[row.deal]] : null
    const areaLabel =
      row.citySlug && row.districtSlug && row.neighborhoodSlug
        ? formatPublicArea({
            city: row.citySlug,
            district: row.districtSlug,
            neighborhood: row.neighborhoodSlug,
          })
        : row.citySlug
          ? (getCity(row.citySlug)?.label ?? row.citySlug)
          : "—"

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as
        | "PENDING"
        | "OPEN"
        | "REJECTED"
        | "FULFILLED"
        | "CLOSED",
      categoryLabel: category,
      dealLabel: deal,
      areaLabel,
      budgetLabel: formatBudgetRange(row.minBudgetIqd, row.maxBudgetIqd),
      rooms: row.rooms,
      areaRangeLabel: formatAreaRange(row.minAreaM2, row.maxAreaM2),
      ownerName: row.user.name,
      ownerEmail: row.user.email,
      ownerPhone: row.user.phone,
      updatedAt: row.updatedAt.toISOString(),
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#0F2744]">
            مراجعة طلبات العقار
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} بانتظار الموافقة · عرض وموافقة وتعديل وحذف من لوحة
            الإدارة مباشرة
          </p>
        </div>
        <Link
          href="/admin/properties"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          مراجعة الإعلانات
        </Link>
      </div>

      <AdminPropertyRequestsManageList requests={requests} />
    </div>
  )
}
