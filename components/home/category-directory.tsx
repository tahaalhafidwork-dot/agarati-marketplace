import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { CategoryIconFrame } from "@/components/home/category-icon-frame"
import { CATEGORY_ICONS } from "@/lib/category-icons"
import { categoryAllowsDaily } from "@/lib/deals"
import {
  countFromIndex,
  getPublicListingCountIndex,
} from "@/lib/listing-service"
import {
  categoryMenuLabels,
  toEnglishDigits,
  type PropertyCategory,
} from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

/** Serializable row — safe to pass Server → Client (no component refs). */
export type CategoryRow = {
  label: string
  subtitle: string
  href: string
  category: PropertyCategory
  count: string
}

const CATEGORY_BASE: Omit<CategoryRow, "count" | "subtitle">[] = [
  {
    label: categoryMenuLabels.apartment,
    href: "/categories/apartments",
    category: "apartment",
  },
  {
    label: categoryMenuLabels.land,
    href: "/categories/lands",
    category: "land",
  },
  {
    label: categoryMenuLabels.house,
    href: "/categories/houses",
    category: "house",
  },
  {
    label: categoryMenuLabels.villa,
    href: "/categories/villas",
    category: "villa",
  },
  {
    label: categoryMenuLabels.office,
    href: "/categories/offices",
    category: "office",
  },
  {
    label: categoryMenuLabels.building,
    href: "/categories/buildings",
    category: "building",
  },
  {
    label: categoryMenuLabels.farm,
    href: "/categories/farms",
    category: "farm",
  },
]

export async function getHomeCategoryRows(): Promise<CategoryRow[]> {
  const index = await getPublicListingCountIndex()
  return CATEGORY_BASE.map((row) => {
    const total = countFromIndex(index, { category: row.category })
    const sale = countFromIndex(index, { category: row.category, deal: "sale" })
    const rent = countFromIndex(index, { category: row.category, deal: "rent" })
    const daily = countFromIndex(index, {
      category: row.category,
      deal: "daily",
    })
    const parts = [
      `للبيع ${toEnglishDigits(sale)}`,
      `للإيجار ${toEnglishDigits(rent)}`,
    ]
    if (categoryAllowsDaily(row.category) && daily > 0) {
      parts.push(`يومي ${toEnglishDigits(daily)}`)
    } else if (categoryAllowsDaily(row.category)) {
      parts.push("إيجار يومي")
    }
    return {
      ...row,
      count: toEnglishDigits(total),
      subtitle: parts.join(" · "),
    }
  })
}

/** @deprecated Prefer getHomeCategoryRows() for live counts. */
export const homeCategoryRows: CategoryRow[] = CATEGORY_BASE.map((row) => ({
  ...row,
  count: "—",
  subtitle: "للبيع · للإيجار",
}))

export function CategoryDirectory({
  rows,
  className,
}: {
  rows: CategoryRow[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-border bg-card",
        className
      )}
    >
      <ul className="divide-y divide-border lg:grid lg:grid-cols-2 lg:divide-y-0 lg:border-0">
        {rows.map((row, index) => (
          <li
            key={row.label}
            className={cn(
              "lg:border-b lg:border-border",
              index % 2 === 0 && "lg:border-e"
            )}
          >
            <Link
              href={row.href}
              className="group flex items-center gap-3.5 px-3.5 py-3.5 transition-colors hover:bg-[#f7f3ec]/80 lg:px-4 lg:py-4"
            >
              <CategoryIconFrame
                icon={CATEGORY_ICONS[row.category]}
                size="md"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-semibold tracking-tight text-[#0F2744]">
                  {row.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[#6B6560]">
                  {row.subtitle}
                </span>
              </span>
              <span className="shrink-0 text-sm tabular-nums text-[#6B6560]">
                ({row.count})
              </span>
              <ChevronLeft className="size-4 shrink-0 text-[#0F2744]/35 transition group-hover:text-[#0F2744]/70" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
