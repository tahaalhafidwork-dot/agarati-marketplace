import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Mail, Phone } from "lucide-react"

import { ListingImage } from "@/components/property/listing-image"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ensureBootstrapAdmin } from "@/lib/admin-service"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { formatPublicArea } from "@/lib/locations"
import {
  formatPriceIqd,
  prismaToCategory,
  prismaToDeal,
} from "@/lib/listings"
import { categoryLabels, dealLabels } from "@/lib/sample-listings"
import { listingImagePublicUrl } from "@/lib/supabase/config"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "تفاصيل إعلان — الإدارة",
}

const statusLabel: Record<string, string> = {
  PENDING: "بانتظار المراجعة",
  ACTIVE: "منشور",
  REJECTED: "مرفوض",
  EXPIRED: "منتهٍ",
}

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await ensureBootstrapAdmin()

  if (!session) {
    return (
      <p className="text-sm text-destructive">يجب تسجيل الدخول.</p>
    )
  }
  if (session.role !== "ADMIN") {
    return (
      <p className="text-sm text-destructive">هذه الصفحة للمسؤولين فقط.</p>
    )
  }
  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        قاعدة البيانات غير مُعدّة — docs/SUPABASE_SETUP.md
      </p>
    )
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsapp: true,
        },
      },
      images: { orderBy: { sortOrder: "asc" } },
    },
  })
  if (!listing) notFound()

  const category = prismaToCategory[listing.category]
  const deal = prismaToDeal[listing.deal]
  const area = formatPublicArea({
    city: listing.citySlug,
    district: listing.districtSlug,
    neighborhood: listing.neighborhoodSlug,
    complex: listing.complexSlug ?? undefined,
    street: listing.streetPrivate?.trim() || undefined,
  })
  const price = formatPriceIqd(listing.priceIqd, deal)
  const imageUrls = listing.images.map((img) =>
    listingImagePublicUrl(img.storagePath)
  )

  const facts: { label: string; value: string }[] = [
    { label: "الحالة", value: statusLabel[listing.status] ?? listing.status },
    {
      label: "رقم الإعلان",
      value: listing.listingNumber ?? listing.id.slice(0, 10),
    },
    { label: "النوع", value: categoryLabels[category] ?? category },
    { label: "الصفقة", value: dealLabels[deal] ?? deal },
    { label: "السعر", value: price },
    { label: "المنطقة", value: area },
    { label: "الغرف", value: listing.rooms ?? "—" },
    {
      label: "المساحة",
      value: listing.areaM2 != null ? `${listing.areaM2} م²` : "—",
    },
    { label: "الطابق", value: listing.floor ?? "—" },
    { label: "التدفئة", value: listing.heating ?? "—" },
    { label: "مفروش", value: listing.furnished ?? "—" },
    {
      label: "مجمع مقترح",
      value: listing.proposedComplexName?.trim() || "—",
    },
    {
      label: "مرجع المجمع",
      value: listing.complexSlug ?? "—",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 lg:max-w-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/properties"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-8 gap-1 px-2 text-xs"
          )}
        >
          <ArrowRight className="size-3.5" />
          العودة للمراجعة
        </Link>
        <div className="flex flex-wrap gap-1.5">
          {listing.status === "ACTIVE" ? (
            <Link
              href={`/properties/${listing.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 px-2.5 text-xs"
              )}
            >
              العرض العام
            </Link>
          ) : null}
          <Link
            href="/admin/properties"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "h-8 px-2.5 text-xs"
            )}
          >
            موافقة / رفض / حذف من القائمة
          </Link>
        </div>
      </div>

      <header className="space-y-2 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h1 className="text-base font-bold text-[#0F2744] md:text-lg lg:text-xl">
              {listing.title}
            </h1>
            <p className="text-sm font-semibold text-[color:var(--brand-gold)] lg:text-base">
              {price}
            </p>
            <p className="text-xs text-muted-foreground">{area}</p>
          </div>
          <Badge
            variant={
              listing.status === "PENDING"
                ? "default"
                : listing.status === "REJECTED"
                  ? "destructive"
                  : "secondary"
            }
            className="shrink-0 text-[0.65rem]"
          >
            {statusLabel[listing.status] ?? listing.status}
          </Badge>
        </div>
        <p className="text-[0.7rem] text-muted-foreground">
          مراجعة للإدارة فقط — التعديل للمعلن من لوحة إعلاناته.
        </p>
      </header>

      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] lg:items-start lg:gap-4 lg:space-y-0">
        <div className="space-y-4">
          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
              {imageUrls.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <ListingImage
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 240px"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              لا توجد صور
            </p>
          )}

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <h2 className="border-b border-border px-3 py-2 text-sm font-semibold text-[#0F2744]">
              بيانات الإعلان
            </h2>
            <dl className="divide-y divide-border">
              {facts.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[7.5rem_1fr] gap-2 px-3 py-2 text-sm sm:grid-cols-[9rem_1fr]"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd
                    className="min-w-0 break-words font-medium text-[#0F2744]"
                    dir={row.label.includes("مرجع") ? "ltr" : undefined}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {listing.services.length > 0 ? (
            <section className="rounded-xl border border-border bg-card p-3">
              <h2 className="mb-2 text-sm font-semibold text-[#0F2744]">
                الخدمات
              </h2>
              <ul className="flex flex-wrap gap-1.5">
                {listing.services.map((s) => (
                  <Badge key={s} variant="outline" className="text-[0.65rem]">
                    {s}
                  </Badge>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-card p-3">
            <h2 className="mb-2 text-sm font-semibold text-[#0F2744]">الوصف</h2>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {listing.description}
            </p>
          </section>

          {listing.moderationNote ? (
            <section className="rounded-xl border border-destructive/25 bg-destructive/5 p-3">
              <h2 className="mb-1 text-sm font-semibold text-destructive">
                ملاحظة المراجعة
              </h2>
              <p className="text-sm text-destructive/90">
                {listing.moderationNote}
              </p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20">
          <section className="rounded-xl border border-border bg-card p-3">
            <h2 className="mb-2 text-sm font-semibold text-[#0F2744]">المعلن</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[#0F2744]">{listing.owner.name}</p>
              <p
                className="inline-flex items-center gap-1 text-muted-foreground"
                dir="ltr"
              >
                <Mail className="size-3.5" />
                {listing.owner.email}
              </p>
              {listing.owner.phone ? (
                <p
                  className="inline-flex items-center gap-1 text-muted-foreground"
                  dir="ltr"
                >
                  <Phone className="size-3.5" />
                  {listing.owner.phone}
                </p>
              ) : null}
              {listing.owner.whatsapp ? (
                <p className="text-xs text-muted-foreground" dir="ltr">
                  واتساب: {listing.owner.whatsapp}
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
