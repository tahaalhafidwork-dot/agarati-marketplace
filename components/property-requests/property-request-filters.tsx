import Link from "next/link"
import { Filter, Search, X } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  buildPropertyRequestsHref,
} from "@/lib/property-requests"
import { cityOptions } from "@/lib/locations"
import {
  categoryLabels,
  dealLabels,
  type DealType,
  type PropertyCategory,
} from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

type Props = {
  tab: string
  filters: {
    category?: string
    deal?: string
    city?: string
    status?: string
    q?: string
  }
  mine?: boolean
}

export function PropertyRequestFilters({ tab, filters, mine }: Props) {
  const base = { tab: tab === "browse" ? undefined : tab }

  return (
    <form
      className="space-y-3 rounded-2xl border border-border bg-card/90 p-3 shadow-sm sm:p-4"
      action="/dashboard/property-requests"
      method="get"
    >
      {tab !== "browse" ? (
        <input type="hidden" name="tab" value={tab} />
      ) : null}

      <div className="flex items-center gap-2 text-sm font-semibold text-[#0F2744]">
        <Filter className="size-4 text-[color:var(--brand-gold)]" />
        تصفية الطلبات
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="ابحث في العناوين والتفاصيل…"
          className="h-11 w-full rounded-xl border border-border bg-background ps-10 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">كل الأنواع</option>
          {(Object.keys(categoryLabels) as PropertyCategory[]).map((c) => (
            <option key={c} value={c}>
              {categoryLabels[c]}
            </option>
          ))}
        </select>
        <select
          name="deal"
          defaultValue={filters.deal ?? ""}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">كل الصفقات</option>
          {(Object.keys(dealLabels) as DealType[]).map((d) => (
            <option key={d} value={d}>
              {dealLabels[d]}
            </option>
          ))}
        </select>
        <select
          name="city"
          defaultValue={filters.city ?? ""}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">كل المدن</option>
          {cityOptions().map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {mine ? (
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="">كل الحالات</option>
            <option value="OPEN">مفتوح</option>
            <option value="FULFILLED">تم التلبية</option>
            <option value="CLOSED">مغلق</option>
          </select>
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}
        >
          تطبيق
        </button>
        <Link
          href={buildPropertyRequestsHref(base)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "rounded-full gap-1"
          )}
        >
          <X className="size-3.5" />
          مسح
        </Link>
      </div>
    </form>
  )
}
