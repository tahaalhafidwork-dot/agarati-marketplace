import type { Metadata } from "next"
import Link from "next/link"
import {
  Eye,
  ExternalLink,
  Heart,
  Pencil,
  RefreshCw,
} from "lucide-react"

import { ListingVisibilityControls } from "@/components/dashboard/listing-visibility-controls"
import { HistoryBackButton } from "@/components/navigation/history-back-button"
import { ListingImage } from "@/components/property/listing-image"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import {
  countQuotaListings,
  expireOverdueListings,
  formatRemainingDaysAr,
  listingQuotaLimit,
  remainingVisibilityDays,
} from "@/lib/listing-quota"
import { prismaToDeal, formatPriceIqd } from "@/lib/listings"
import { listingImagePublicUrl } from "@/lib/supabase/config"
import { cn } from "@/lib/utils"
import { getActiveAgencyMembership } from "@/lib/agency-service"
import { reassignAgencyListingAction } from "@/lib/actions/agency"
import { requestListingPaymentAction } from "@/lib/actions/payments"

export const metadata: Metadata = {
  title: "عقاراتي",
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function MyPropertiesPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const sp = searchParams ? await searchParams : {}
  const noticeRaw = Array.isArray(sp.notice) ? sp.notice[0] : sp.notice
  const user = await getSessionUser()
  const membership = user && isDatabaseConfigured()
    ? await getActiveAgencyMembership(user.id)
    : null

  if (user && isDatabaseConfigured()) {
    await Promise.all([
      expireOverdueListings({ ownerId: user.id }),
      membership
        ? expireOverdueListings({ agencyId: membership.agencyId })
        : Promise.resolve(0),
    ])
  }

  const listings =
    user && isDatabaseConfigured()
      ? await prisma.listing.findMany({
          where: {
            OR: [
              { ownerId: user.id, agencyId: null },
              ...(membership
                ? membership.role === "OWNER"
                  ? [{ agencyId: membership.agencyId }]
                  : [{ agencyId: membership.agencyId, assignedAgentId: user.id }]
                : []),
            ],
          },
          orderBy: { updatedAt: "desc" },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            _count: { select: { favorites: true } },
            agency: { select: { name: true } },
            assignedAgent: { select: { name: true } },
            payments: {
              where: { status: "PENDING" },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        })
      : []
  const agencyMembers =
    membership?.role === "OWNER"
      ? await prisma.agencyMembership.findMany({
          where: { agencyId: membership.agencyId, status: "ACTIVE" },
          select: { userId: true, user: { select: { name: true } } },
          orderBy: { joinedAt: "asc" },
        })
      : []

  const quotaLimit = user
    ? listingQuotaLimit({
        accountType: user.accountType,
        agencyUpgradeStatus: user.agencyUpgradeStatus,
      })
    : 3
  const quotaUsed =
    user && isDatabaseConfigured() ? await countQuotaListings(user.id) : 0
  const quotaFull = quotaUsed >= quotaLimit
  const canCreate = !quotaFull || Boolean(membership)

  const statusLabel: Record<string, string> = {
    DRAFT: "مسودة",
    PENDING: "قيد المراجعة",
    ACTIVE: "منشور",
    REJECTED: "مرفوض",
    EXPIRED: "منتهٍ",
  }

  const statusTone: Record<string, string> = {
    DRAFT: "bg-muted text-muted-foreground",
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-red-50 text-red-800 border-red-200",
    EXPIRED: "bg-stone-100 text-stone-700 border-stone-200",
  }

  return (
    <div className="space-y-4">
      <HistoryBackButton fallbackHref="/dashboard" />
      {noticeRaw === "review" ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          حُفظ التعديل وأُعيد الإعلان إلى «قيد المراجعة». لن يظهر في الموقع العام
          حتى تعتمده الإدارة.
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">عقاراتي</h1>
          <p className="text-sm text-muted-foreground">
            إدارة إعلاناتك المنشورة وقيد المراجعة
          </p>
        </div>
        {!canCreate ? (
          <span
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "pointer-events-none opacity-50"
            )}
            aria-disabled
          >
            إعلان جديد
          </span>
        ) : (
          <Link
            href="/dashboard/properties/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            إعلان جديد
          </Link>
        )}
      </div>

      {user && isDatabaseConfigured() ? (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[#0F2744]">
              المخزون النشط:{" "}
              <span className="font-semibold tabular-nums">
                {quotaUsed}/{quotaLimit}
              </span>
              <span className="ms-1.5 text-xs text-muted-foreground">
                (
                فردي — الإعلان الأول مجاني دائمًا، والثاني والثالث مدفوعان
                )
              </span>
            </p>
            {quotaFull ? (
              <p className="text-xs text-amber-800">
                وصلت للحد الأقصى — احذف إعلاناً أو انتظر انتهاء أحدها
              </p>
            ) : null}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                quotaFull ? "bg-amber-600" : "bg-[#0F2744]"
              )}
              style={{
                width: `${Math.min(100, (quotaUsed / quotaLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {!isDatabaseConfigured() ? (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
          اربط Supabase وقاعدة البيانات أولاً — راجع docs/SUPABASE_SETUP.md
        </p>
      ) : listings.length === 0 ? (
        <p className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">
          لا إعلانات بعد.{" "}
          <Link
            href="/dashboard/properties/new"
            className="text-primary hover:underline"
          >
            أضف أول إعلان مجاناً
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {listings.map((item) => {
            const thumb = item.images[0]
              ? listingImagePublicUrl(item.images[0].storagePath)
              : "/placeholder-listing.svg"
            const isPublished =
              item.status === "ACTIVE" && !item.visibilityPaused
            const canEdit =
              item.status === "ACTIVE" ||
              item.status === "PENDING" ||
              item.status === "REJECTED" ||
              item.status === "DRAFT" ||
              item.status === "EXPIRED"
            const daysLeft = remainingVisibilityDays(item.expiresAt)
            const remainingLabel =
              item.status === "ACTIVE" || item.status === "EXPIRED"
                ? formatRemainingDaysAr(
                    item.status === "EXPIRED" ? 0 : daysLeft
                  )
                : ""

            let displayStatus: string = item.status
            let displayLabel = statusLabel[item.status] ?? item.status
            let displayTone = statusTone[item.status] ?? ""
            if (item.status === "ACTIVE" && item.visibilityPaused) {
              displayStatus = "HIDDEN"
              displayLabel = "مخفي يدوياً"
              displayTone = "bg-slate-100 text-slate-700 border-slate-200"
            }

            return (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:gap-4",
                  item.status === "REJECTED" &&
                    "border-s-[3px] border-s-[#B8956C]/80 bg-[linear-gradient(90deg,rgba(184,149,108,0.07),transparent_55%)]"
                )}
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted sm:size-20 lg:size-24">
                    <ListingImage
                      src={thumb}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    {item.status === "REJECTED" ? (
                      <span className="absolute inset-0 bg-[#0F2744]/25" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#0F2744] lg:text-[0.95rem]">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground lg:text-sm">
                          {formatPriceIqd(item.priceIqd, prismaToDeal[item.deal])}
                        </p>
                        {remainingLabel ? (
                          <p className="mt-1 text-[0.7rem] text-muted-foreground">
                            {remainingLabel}
                          </p>
                        ) : null}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-[0.65rem]">
                            {item.agencyId
                              ? `الوكالة · ${item.agency?.name ?? ""}`
                              : item.billingKind === "PERSONAL_FREE"
                                ? "الإعلان المجاني"
                                : "إعلان مدفوع · 5,000 د.ع"}
                          </Badge>
                          {item.billingState === "PAYMENT_REQUIRED" ? (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[0.65rem] text-amber-800">
                              {item.payments.length ? "الدفع قيد المراجعة" : "الدفع مطلوب"}
                            </Badge>
                          ) : null}
                          {item.billingState === "SUBSCRIPTION_REQUIRED" ? (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[0.65rem] text-amber-800">اشتراك الوكالة مطلوب</Badge>
                          ) : null}
                          {item.agencyId && item.assignedAgent ? (
                            <Badge variant="secondary" className="text-[0.65rem]">المسؤول: {item.assignedAgent.name}</Badge>
                          ) : null}
                        </div>
                        {item.status === "REJECTED" ? (
                          <p className="mt-1.5 text-[0.7rem] leading-5 text-[#6B6560]">
                            {item.moderationNote &&
                            item.moderationNote !== "مرفوض من الإدارة"
                              ? `ملاحظة الإدارة: ${item.moderationNote}`
                              : "لم يُنشر — عدّل الإعلان ثم أعد إرساله للمراجعة."}
                          </p>
                        ) : null}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 border", displayTone)}
                        data-status={displayStatus}
                      >
                        {displayLabel}
                      </Badge>
                    </div>

                    {(item.status === "ACTIVE" ||
                      item.status === "PENDING" ||
                      item.status === "EXPIRED" ||
                      item.viewCount > 0 ||
                      item._count.favorites > 0) &&
                    item.status !== "DRAFT" &&
                    item.status !== "REJECTED" ? (
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3.5" strokeWidth={1.75} />
                          {item.viewCount.toLocaleString("en-US")} زيارة
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="size-3.5" strokeWidth={1.75} />
                          {item._count.favorites.toLocaleString("en-US")} مفضلة
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
                  {!item.agencyId &&
                  item.billingKind === "PERSONAL_PAID" &&
                  item.billingState === "PAYMENT_REQUIRED" &&
                  item.payments.length === 0 ? (
                    <form action={requestListingPaymentAction}>
                      <input type="hidden" name="listingId" value={item.id} />
                      <button type="submit" className="h-7 rounded-lg bg-[#0F2744] px-2.5 text-xs font-medium text-white hover:bg-[#0F2744]/90">
                        طلب اعتماد 5,000 د.ع
                      </button>
                    </form>
                  ) : null}
                  {item.agencyId && membership?.role === "OWNER" ? (
                    <form action={reassignAgencyListingAction} className="flex items-center gap-1.5">
                      <input type="hidden" name="listingId" value={item.id} />
                      <select
                        name="assigneeUserId"
                        defaultValue={item.assignedAgentId ?? ""}
                        className="h-7 rounded-lg border border-input bg-background px-2 text-xs"
                        aria-label="مسؤول العقار"
                      >
                        <option value="">بلا مسؤول</option>
                        {agencyMembers.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.user.name}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="h-7 rounded-lg border border-border px-2 text-xs hover:bg-muted">
                        تعيين
                      </button>
                    </form>
                  ) : null}
                  {item.status === "REJECTED" ? (
                    <Link
                      href={`/dashboard/properties/${item.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "gap-1.5"
                      )}
                    >
                      <RefreshCw className="size-3.5" />
                      تعديل وإعادة الإرسال
                    </Link>
                  ) : (
                    <>
                      {canEdit ? (
                        <Link
                          href={`/dashboard/properties/${item.id}/edit`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "gap-1.5"
                          )}
                        >
                          <Pencil className="size-3.5" />
                          تعديل
                        </Link>
                      ) : null}
                      <ListingVisibilityControls
                        listingId={item.id}
                        status={item.status}
                        visibilityPaused={item.visibilityPaused}
                      />
                      {isPublished ? (
                        <Link
                          href={`/properties/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({
                              variant: "secondary",
                              size: "sm",
                            }),
                            "gap-1.5"
                          )}
                        >
                          <ExternalLink className="size-3.5" />
                          فتح الإعلان
                        </Link>
                      ) : null}
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
