"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deletePropertyRequestAction,
  moderatePropertyRequestAction,
} from "@/lib/actions/property-requests"
import { requestStatusLabels } from "@/lib/property-requests"
import { cn } from "@/lib/utils"

export type AdminPropertyRequestRow = {
  id: string
  title: string
  description: string
  status: "PENDING" | "OPEN" | "REJECTED" | "FULFILLED" | "CLOSED"
  categoryLabel: string | null
  dealLabel: string | null
  areaLabel: string
  budgetLabel: string
  rooms: string | null
  areaRangeLabel: string | null
  ownerName: string
  ownerEmail: string
  ownerPhone: string | null
  updatedAt: string
}

type StatusScope = "all" | "pending" | "published" | "rejected" | "unpublished"

const statusTone: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-900 border-amber-200",
  OPEN: "bg-emerald-50 text-emerald-900 border-emerald-200",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/25",
  FULFILLED: "bg-muted text-muted-foreground",
  CLOSED: "bg-muted text-muted-foreground",
}

function matchesQuery(row: AdminPropertyRequestRow, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const hay = [
    row.title,
    row.description,
    row.id,
    row.ownerName,
    row.ownerEmail,
    row.ownerPhone ?? "",
    row.areaLabel,
    row.budgetLabel,
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(needle)
}

function matchesScope(row: AdminPropertyRequestRow, scope: StatusScope) {
  if (scope === "all") return true
  if (scope === "pending") return row.status === "PENDING"
  if (scope === "published") return row.status === "OPEN"
  if (scope === "rejected") return row.status === "REJECTED"
  return row.status !== "OPEN"
}

export function AdminPropertyRequestsManageList({
  requests,
}: {
  requests: AdminPropertyRequestRow[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<StatusScope>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(
    () =>
      requests.filter(
        (row) => matchesQuery(row, query) && matchesScope(row, scope)
      ),
    [requests, query, scope]
  )

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      published: requests.filter((r) => r.status === "OPEN").length,
      unpublished: requests.filter((r) => r.status !== "OPEN").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    }),
    [requests]
  )

  function run(
    id: string,
    fn: () => Promise<void>,
    okMessage: string
  ) {
    setMessage(null)
    setBusyId(id)
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

  function confirmDelete(row: AdminPropertyRequestRow) {
    if (
      !window.confirm(
        `حذف طلب العقار نهائياً؟\n«${row.title}»\nلا يمكن التراجع.`
      )
    ) {
      return
    }
    run(
      row.id,
      () => deletePropertyRequestAction(row.id),
      "تم حذف الطلب."
    )
  }

  const scopes: { id: StatusScope; label: string; count: number }[] = [
    { id: "all", label: "الكل", count: counts.all },
    { id: "pending", label: "بانتظار", count: counts.pending },
    { id: "published", label: "منشور", count: counts.published },
    { id: "unpublished", label: "غير منشور", count: counts.unpublished },
    { id: "rejected", label: "مرفوض", count: counts.rejected },
  ]

  return (
    <div className="space-y-3">
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث: عنوان، وصف، طالب، بريد، هاتف…"
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
        {filtered.length} من {requests.length} طلب
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">
          لا نتائج مطابقة.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((row) => {
            const open = expandedId === row.id
            const busy = busyId === row.id && pending
            return (
              <li key={row.id}>
                <div className="space-y-2 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-md text-[0.6rem]",
                            statusTone[row.status]
                          )}
                        >
                          {requestStatusLabels[row.status]}
                        </Badge>
                        {row.dealLabel ? (
                          <Badge className="rounded-md bg-[#0F2744] text-[0.6rem] text-[#f8f1e6]">
                            {row.dealLabel}
                          </Badge>
                        ) : null}
                        {row.categoryLabel ? (
                          <Badge
                            variant="secondary"
                            className="rounded-md text-[0.6rem]"
                          >
                            {row.categoryLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm font-semibold text-[#0F2744]">
                        {row.title}
                      </p>
                      <p className="line-clamp-2 text-[0.7rem] leading-5 text-muted-foreground">
                        {row.description}
                      </p>
                      <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[0.65rem] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {row.areaLabel}
                        </span>
                        <span>{row.budgetLabel}</span>
                        {row.rooms ? <span>غرف: {row.rooms}</span> : null}
                        {row.areaRangeLabel ? (
                          <span>{row.areaRangeLabel}</span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.65rem] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-medium text-[#0F2744]">
                          <UserRound className="size-3" />
                          {row.ownerName}
                        </span>
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
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[0.65rem]"
                      onClick={() => setExpandedId(open ? null : row.id)}
                    >
                      {open ? "إخفاء التفاصيل" : "عرض المحتوى"}
                    </Button>
                    <Link
                      href={`/dashboard/property-requests/${row.id}/edit`}
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        "h-7 gap-1 px-2 text-[0.65rem]"
                      )}
                    >
                      <Pencil className="size-3" />
                      تعديل
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
                    {row.status === "PENDING" || row.status === "REJECTED" ? (
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 px-2 text-[0.65rem]"
                        disabled={busy}
                        onClick={() =>
                          run(
                            row.id,
                            () =>
                              moderatePropertyRequestAction(row.id, "OPEN"),
                            "تم قبول الطلب ونشره."
                          )
                        }
                      >
                        قبول ونشر
                      </Button>
                    ) : null}
                    {row.status === "PENDING" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-[0.65rem]"
                        disabled={busy}
                        onClick={() =>
                          run(
                            row.id,
                            () =>
                              moderatePropertyRequestAction(
                                row.id,
                                "REJECTED"
                              ),
                            "تم رفض الطلب."
                          )
                        }
                      >
                        رفض
                      </Button>
                    ) : null}
                    {row.status === "OPEN" ? (
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
                              moderatePropertyRequestAction(
                                row.id,
                                "REJECTED"
                              ),
                            "تم سحب الطلب من النشر."
                          )
                        }
                      >
                        سحب النشر
                      </Button>
                    ) : null}
                  </div>
                </div>

                {open ? (
                  <div className="space-y-2 border-t border-border bg-[#faf6ef]/50 px-3 py-3">
                    <p className="text-[0.65rem] font-semibold text-[#0F2744]">
                      محتوى الطلب كاملاً
                    </p>
                    <p className="whitespace-pre-wrap text-[0.75rem] leading-6 text-foreground">
                      {row.description}
                    </p>
                    <dl className="grid grid-cols-2 gap-2 text-[0.7rem] sm:grid-cols-3">
                      <div>
                        <dt className="text-muted-foreground">الموقع</dt>
                        <dd className="font-medium text-[#0F2744]">
                          {row.areaLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">الميزانية</dt>
                        <dd className="font-medium text-[#0F2744]">
                          {row.budgetLabel}
                        </dd>
                      </div>
                      {row.rooms ? (
                        <div>
                          <dt className="text-muted-foreground">الغرف</dt>
                          <dd className="font-medium text-[#0F2744]">
                            {row.rooms}
                          </dd>
                        </div>
                      ) : null}
                      {row.areaRangeLabel ? (
                        <div>
                          <dt className="text-muted-foreground">المساحة</dt>
                          <dd className="font-medium text-[#0F2744]">
                            {row.areaRangeLabel}
                          </dd>
                        </div>
                      ) : null}
                      {row.categoryLabel ? (
                        <div>
                          <dt className="text-muted-foreground">النوع</dt>
                          <dd className="font-medium text-[#0F2744]">
                            {row.categoryLabel}
                          </dd>
                        </div>
                      ) : null}
                      {row.dealLabel ? (
                        <div>
                          <dt className="text-muted-foreground">الصفقة</dt>
                          <dd className="font-medium text-[#0F2744]">
                            {row.dealLabel}
                          </dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-muted-foreground">آخر تحديث</dt>
                        <dd className="font-medium text-[#0F2744]">
                          {new Date(row.updatedAt).toLocaleString("ar-IQ")}
                        </dd>
                      </div>
                    </dl>
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
