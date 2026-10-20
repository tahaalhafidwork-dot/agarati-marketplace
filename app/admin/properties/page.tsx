import type { Metadata } from "next"

import { AdminListingsManageList } from "@/components/admin/admin-listings-manage-list"
import {
  demoAdminListingRows,
  ensureBootstrapAdmin,
} from "@/lib/admin-service"
import { listApprovedProjectsForComplexes } from "@/lib/complex-options"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { formatPublicArea } from "@/lib/locations"
import {
  formatPriceIqd,
  prismaToCategory,
  prismaToDeal,
} from "@/lib/listings"
import { categoryLabels, dealLabels } from "@/lib/sample-listings"
import { listingImagePublicUrl } from "@/lib/supabase/config"

export const metadata: Metadata = {
  title: "مراجعة العقارات",
}

export default async function AdminPropertiesPage() {
  const session = await ensureBootstrapAdmin()

  if (!session) {
    return (
      <p className="text-sm text-destructive">
        يجب تسجيل الدخول لعرض طابور المراجعة.
      </p>
    )
  }

  if (session.role !== "ADMIN") {
    return (
      <p className="text-sm text-destructive">
        هذه الصفحة للمسؤولين فقط. سجّل الدخول بحسابك — إن لم يوجد مشرف بعد
        يُمنح أول حساب دور ADMIN تلقائياً.
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

  const rows = await prisma.listing.findMany({
    where: { status: { in: ["PENDING", "ACTIVE", "REJECTED", "EXPIRED"] } },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    include: {
      owner: {
        select: { name: true, email: true, phone: true, whatsapp: true },
      },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { images: true } },
    },
  })

  const approvedProjects = await listApprovedProjectsForComplexes(200)

  const pendingFirst = [...rows].sort((a, b) => {
    const rank = (s: string) =>
      s === "PENDING" ? 0 : s === "ACTIVE" ? 1 : s === "REJECTED" ? 2 : 3
    const d = rank(a.status) - rank(b.status)
    if (d !== 0) return d
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const demos =
    pendingFirst.length === 0
      ? demoAdminListingRows().map((item) => ({
          id: item.id,
          title: item.title,
          status: "PENDING" as const,
          listingNumber: item.listingNumber ?? null,
          priceLabel: item.price,
          dealLabel: dealLabels[item.deal],
          categoryLabel: categoryLabels[item.category],
          areaLabel: item.area,
          imageUrl: item.image,
          imageCount: item.images?.length ?? 1,
          ownerName: item.ownerName,
          ownerEmail: "demo@agarati.local",
          ownerPhone: null,
          ownerWhatsapp: null,
          proposedComplexName: null,
          complexSlug: null,
          moderationNote: null,
          updatedAt: new Date().toISOString(),
          isDemo: true as const,
        }))
      : []

  const listings =
    pendingFirst.length > 0
      ? pendingFirst.map((item) => {
          const deal = prismaToDeal[item.deal]
          const category = prismaToCategory[item.category]
          const area = formatPublicArea({
            city: item.citySlug,
            district: item.districtSlug,
            neighborhood: item.neighborhoodSlug,
            complex: item.complexSlug ?? undefined,
          })
          const imageUrl = item.images[0]
            ? listingImagePublicUrl(item.images[0].storagePath)
            : null
          return {
            id: item.id,
            title: item.title,
            status: item.status as
              | "PENDING"
              | "ACTIVE"
              | "REJECTED"
              | "EXPIRED",
            listingNumber: item.listingNumber,
            priceLabel: formatPriceIqd(item.priceIqd, deal),
            dealLabel: dealLabels[deal],
            categoryLabel: categoryLabels[category],
            areaLabel: area,
            imageUrl,
            imageCount: item._count.images,
            ownerName: item.owner.name,
            ownerEmail: item.owner.email,
            ownerPhone: item.owner.phone,
            ownerWhatsapp: item.owner.whatsapp,
            proposedComplexName: item.proposedComplexName,
            complexSlug: item.complexSlug,
            moderationNote: item.moderationNote,
            updatedAt: item.updatedAt.toISOString(),
          }
        })
      : demos

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#0F2744]">
          مراجعة العقارات
        </h1>
        <p className="text-sm text-muted-foreground">
          {pendingFirst.length > 0
            ? "قائمة الإعلانات — بحث بالمعلن أو البريد أو الهاتف أو رقم الإعلان، وفرز المنشور / غير المنشور"
            : "لا إعلانات حقيقية بعد — عيّنات تجريبية للمعاينة فقط"}
        </p>
      </div>

      <AdminListingsManageList
        listings={listings}
        approvedProjects={approvedProjects.map((p) => ({
          slug: p.slug,
          name: p.name,
        }))}
      />
    </div>
  )
}
