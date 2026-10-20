"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Images,
  Mail,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react"

import { AdminListingModerateForm } from "@/components/admin/admin-listing-moderate-form"
import { ListingImage } from "@/components/property/listing-image"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deleteListingAction,
  moderateListingAction,
} from "@/lib/actions/listings"
import { cn } from "@/lib/utils"

export type AdminListingRow = {
  id: string
  title: string
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED"
  listingNumber: string | null
  priceLabel: string
  dealLabel: string
  categoryLabel: string
  areaLabel: string
  imageUrl: string | null
  imageCount: number
  ownerName: string
  ownerEmail: string
  ownerPhone: string | null
  ownerWhatsapp: string | null
  representativeName: string | null
  representativeRole: "OWNER" | "AGENT" | null
  proposedComplexName: string | null
  complexSlug: string | null
  moderationNote: string | null
  updatedAt: string
  /** Sample rows when DB has no listings — actions disabled */
  isDemo?: boolean
}

type StatusScope = "all" | "published" | "unpublished" | "pending"

const statusLabel: Record<string, string> = {
  PENDING: "بانتظار المراجعة",
  ACTIVE: "منشور",
  REJECTED: "مرفوض",
  EXPIRED: "منتهٍ",
}

function matchesQuery(row: AdminListingRow, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const hay = [
    row.title,
    row.id,
    row.listingNumber ?? "",
    row.ownerName,
    row.representativeName ?? "",
    row.ownerEmail,
    row.ownerPhone ?? "",
    row.ownerWhatsapp ?? "",
    row.areaLabel,
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(needle)
}

function matchesScope(row: AdminListingRow, scope: StatusScope) {
  if (scope === "all") return true
  if (scope === "published") return row.status === "ACTIVE"
  if (scope === "pending") return row.status === "PENDING"
  return row.status !== "ACTIVE"
}

export function AdminListingsManageList({
  listings,
  approvedProjects,
}: {
  listings: AdminListingRow[]
  approvedProjects: { slug: string; name: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<StatusScope>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return listings.filter(
      (row) => matchesQuery(row, query) && matchesScope(row, scope)
    )
  }, [listings, query, scope])

  const counts = useMemo(() => {
    return {
      all: listings.length,
      published: listings.filter((r) => r.status === "ACTIVE").length,
      unpublished: listings.filter((r) => r.status !== "ACTIVE").length,
      pending: listings.filter((r) => r.status === "PENDING").length,
    }
  }, [listings])

  function run(
    listingId: string,
    fn: () => Promise<void>,
    okMessage: string
  ) {
    setMessage(null)
    setBusyId(listingId)
    startTransition(async () => {
      try {
        await fn()
        setMessage(okMessage)
        router.refresh()
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "تعذّر تنفيذ العملية")
      } finally {
        setBusyId(null)
      }
    })
  }

  function confirmDelete(row: AdminListingRow) {
    const label = row.listingNumber || row.title
    if (
      !window.confirm(
        `حذف الإعلان نهائياً؟\n${label}\nلا يمكن التراجع عن هذا الإجراء.`
      )
    ) {
      return
    }
    run(row.id, () => deleteListingAction(row.id), "تم حذف الإعلان.")
  }

  const scopes: { id: StatusScope; label: string; count: number }[] = [
    { id: "all", label: "الكل", count: counts.all },
    { id: "published", label: "منشور", count: counts.published },
    { id: "unpublished", label: "غير منشور", count: counts.unpublished },
    { id: "pending", label: "بانتظار", count: counts.pending },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث: معلن، بريد، هاتف، رقم إعلان، عنوان…"
            className="h-9 ps-8 pe-8 text-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="مسح البحث"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
        {scopes.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScope(s.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
              scope === s.id
                ? "bg-[#0F2744] text-[color:var(--brand-gold)]"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
            <span className="tabular-nums opacity-80">{s.count}</span>
          </button>
        ))}
      </div>

      {message ? (
        <p className="text-xs font-medium text-emerald-700">{message}</p>
      ) : null}

      <p className="text-[0.7rem] text-muted-foreground">
        {filtered.length} من {listings.length} إعلان
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">
          لا نتائج مطابقة للبحث أو الفلتر.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((row) => {
            const open = expandedId === row.id
            const busy = busyId === row.id && pending
            return (
              <li key={row.id} className="bg-card">
                <div className="flex flex-col gap-2.5 p-2.5 sm:gap-3 sm:p-3 lg:flex-row lg:items-start lg:gap-4 lg:p-3.5">
                  <div className="flex min-w-0 flex-1 gap-2.5 sm:gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16 lg:size-20">
                    {row.imageUrl ? (
                      <ListingImage
                        src={row.imageUrl}
                        alt={row.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <Images className="size-4" />
                      </div>
                    )}
                    {row.imageCount > 1 ? (
                      <span className="absolute bottom-0.5 start-0.5 rounded bg-black/65 px-1 text-[0.5rem] text-white">
                        {row.imageCount}
                      </span>
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0F2744] lg:text-[0.95rem]">
                          {row.title}
                        </p>
                        <p className="text-[0.7rem] font-medium text-[color:var(--brand-gold)] lg:text-xs">
                          {row.priceLabel}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                        {row.proposedComplexName &&
                        (row.status === "PENDING" ||
                          row.status === "REJECTED") ? (
                          <Badge
                            variant="outline"
                            className="border-[color:var(--brand-gold)]/40 text-[0.58rem] text-[color:var(--brand-gold)]"
                          >
                            مجمع مقترح
                          </Badge>
                        ) : null}
                        <Badge
                          variant={
                            row.status === "PENDING"
                              ? "default"
                              : row.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-[0.6rem]"
                        >
                          {statusLabel[row.status] ?? row.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="truncate text-[0.68rem] text-muted-foreground">
                      {row.dealLabel} · {row.categoryLabel} · {row.areaLabel}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.65rem] text-muted-foreground lg:mt-1">
                      <span className="font-medium text-[#0F2744]">
                        {row.ownerName}
                      </span>
                      {row.representativeName ? (
                        <span className="rounded-md bg-[#0F2744]/6 px-1.5 py-0.5 text-[#0F2744]/75">
                          {row.representativeRole === "OWNER"
                            ? "صاحب الوكالة"
                            : "الوكيل العقاري"}
                          : {row.representativeName}
                        </span>
                      ) : null}
                      <span
                        className="inline-flex items-center gap-0.5"
                        dir="ltr"
                      >
                        <Mail className="size-2.5" />
                        {row.ownerEmail}
                      </span>
                      {row.ownerPhone ? (
                        <span
                          className="inline-flex items-center gap-0.5"
                          dir="ltr"
                        >
                          <Phone className="size-2.5" />
                          {row.ownerPhone}
                        </span>
                      ) : null}
                      {row.listingNumber ? (
                        <span dir="ltr" className="tabular-nums">
                          #{row.listingNumber}
                        </span>
                      ) : (
                        <span dir="ltr" className="truncate opacity-70">
                          id:{row.id.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                  </div>

                    <div className="flex flex-wrap gap-1 pt-0.5 lg:w-52 lg:shrink-0 lg:justify-end lg:pt-0">
                      {row.isDemo ? (
                        <Badge variant="outline" className="h-7 text-[0.6rem]">
                          تجريبي — بدون إجراءات
                        </Badge>
                      ) : (
                        <>
                          <Link
                            href={`/admin/properties/${row.id}`}
                            className={cn(
                              buttonVariants({
                                size: "sm",
                                variant: "outline",
                              }),
                              "h-7 gap-1 px-2 text-[0.65rem]"
                            )}
                          >
                            <Eye className="size-3" />
                            التفاصيل
                          </Link>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-[0.65rem] text-destructive hover:text-destructive"
                            disabled={busy}
                            onClick={() => confirmDelete(row)}
                          >
                            <Trash2 className="size-3" />
                            حذف
                          </Button>
                          {row.status === "ACTIVE" ? (
                            <>
                              <Link
                                href={`/properties/${row.id}`}
                                className={cn(
                                  buttonVariants({
                                    size: "sm",
                                    variant: "ghost",
                                  }),
                                  "h-7 px-2 text-[0.65rem]"
                                )}
                              >
                                العرض العام
                              </Link>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[0.65rem]"
                                disabled={busy}
                                onClick={() =>
                                  run(
                                    row.id,
                                    () =>
                                      moderateListingAction(row.id, "REJECTED", {
                                        note: "إلغاء نشر من الإدارة",
                                      }),
                                    "تم إلغاء نشر الإعلان."
                                  )
                                }
                              >
                                إلغاء النشر
                              </Button>
                            </>
                          ) : null}
                          {row.status === "PENDING" ||
                          row.status === "REJECTED" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant={open ? "secondary" : "outline"}
                              className={cn(
                                "h-7 gap-1 px-2 text-[0.65rem]",
                                open && "bg-[#0F2744]/8 text-[#0F2744]"
                              )}
                              aria-expanded={open}
                              onClick={() =>
                                setExpandedId(open ? null : row.id)
                              }
                            >
                              {open ? (
                                <ChevronUp className="size-3" />
                              ) : (
                                <ChevronDown className="size-3" />
                              )}
                              {open
                                ? "إغلاق القرار"
                                : row.proposedComplexName
                                  ? "قرار الإعلان والمجمع"
                                  : "اتخاذ قرار"}
                            </Button>
                          ) : null}
                        </>
                      )}
                    </div>
                </div>

                {open &&
                (row.status === "PENDING" || row.status === "REJECTED") ? (
                  <div className="border-t border-border bg-muted/20 px-3 py-3 lg:px-4">
                    <div className="lg:max-w-xl lg:ms-auto">
                    <AdminListingModerateForm
                      listingId={row.id}
                      listingStatus={row.status}
                      proposedComplexName={row.proposedComplexName}
                      complexSlug={row.complexSlug}
                      approvedProjects={approvedProjects}
                      moderationNote={row.moderationNote}
                      onDone={() => setExpandedId(null)}
                    />
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
