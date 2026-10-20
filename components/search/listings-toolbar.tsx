"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpDown,
  Check,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import {
  draftFromQuery,
  draftToQueryPatch,
  emptyFilterDraft,
  ListingsFilterFields,
  type ListingsFilterDraft,
} from "@/components/search/listings-filter-fields"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  buildPropertiesHref,
  countActiveFilters,
  sortLabel,
  sortOptions,
  type ListingQuery,
  type SortKey,
} from "@/lib/listing-query"
import { cn } from "@/lib/utils"

type Props = {
  query: ListingQuery
  /** Preserve map/list mode when applying filters or sort */
  view?: "list" | "map"
  catalogProjects?: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>
}

/** Filter + sort toolbar — each opens its own bottom sheet. */
export function ListingsToolbar({
  query,
  view = "list",
  catalogProjects,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const activeCount = countActiveFilters(query)
  const currentSort = (query.sort ?? "newest") as SortKey

  const navigate = (next: ListingQuery) => {
    startTransition(() => {
      router.push(buildPropertiesHref({ ...next, view }))
    })
  }

  return (
    <>
      <div className="border-b border-[#0F2744]/8 bg-[linear-gradient(180deg,#fff_0%,#fbfaf8_100%)] px-3 py-1.5 md:px-4">
        <div
          className="flex items-center gap-2.5"
          role="toolbar"
          aria-label="تصفية وترتيب"
        >
          <button
            type="button"
            className={cn(
              "group relative flex h-9 min-w-0 flex-1 items-center justify-between gap-3 overflow-hidden rounded-full border px-3.5 text-xs font-semibold text-white transition-all duration-200",
              activeCount > 0
                ? "border-[#C7A77E]/55 bg-[linear-gradient(135deg,#0B213B_0%,#173B61_100%)] shadow-[0_6px_18px_rgba(15,39,68,0.22)] hover:shadow-[0_8px_22px_rgba(15,39,68,0.26)]"
                : "border-[#B8956C]/35 bg-[linear-gradient(135deg,#0F2744_0%,#193B5E_100%)] shadow-[0_5px_16px_rgba(15,39,68,0.18)] hover:border-[#B8956C]/55 hover:shadow-[0_7px_20px_rgba(15,39,68,0.23)]"
            )}
            onClick={() => setFilterOpen(true)}
            aria-haspopup="dialog"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <SlidersHorizontal
                className="size-3.5 shrink-0 text-[#D6B98F]"
                strokeWidth={2}
              />
              <span className="h-4 w-px shrink-0 bg-[#D6B98F]/35" aria-hidden />
              <span className="truncate tracking-[0.01em]">تصفية النتائج</span>
            </span>
            {activeCount > 0 ? (
              <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-[#C7A77E] px-1.5 py-1 text-[0.62rem] font-bold leading-none text-[#0F2744] shadow-[0_1px_4px_rgba(0,0,0,0.16)]">
                {activeCount}
              </span>
            ) : (
              <span className="size-1.5 shrink-0 rounded-full bg-[#D6B98F] shadow-[0_0_0_3px_rgba(214,185,143,0.12)]" aria-hidden />
            )}
          </button>

          <button
            type="button"
            className={cn(
              "flex h-8 max-w-[6.75rem] shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-[0.65rem] font-medium ring-1 transition-colors",
              currentSort !== "newest"
                ? "bg-[#B8956C]/10 text-[#0F2744] ring-[#B8956C]/30"
                : "bg-white/75 text-[#0F2744]/65 ring-[#0F2744]/10 hover:bg-white hover:text-[#0F2744] hover:ring-[#0F2744]/20"
            )}
            onClick={() => setSortOpen(true)}
            aria-haspopup="dialog"
            disabled={pending}
          >
            <ArrowUpDown
              className="size-3 shrink-0 text-[#9A7854]"
              strokeWidth={1.8}
            />
            <span className="truncate">
              {sortLabel(currentSort)}
            </span>
          </button>
        </div>
      </div>

      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        query={query}
        pending={pending}
        catalogProjects={catalogProjects}
        onApply={(next) => {
          setFilterOpen(false)
          navigate(next)
        }}
      />

      <SortSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        currentSort={currentSort}
        pending={pending}
        onSelect={(sort) => {
          setSortOpen(false)
          navigate({ ...query, sort })
        }}
      />
    </>
  )
}

function SortSheet({
  open,
  onOpenChange,
  currentSort,
  pending,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSort: SortKey
  pending: boolean
  onSelect: (sort: SortKey) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 rounded-t-2xl border-border p-0"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" aria-hidden />
        <SheetHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-border px-4 py-3 text-start">
          <div>
            <SheetTitle className="text-base font-semibold text-foreground">
              ترتيب الإعلانات
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              اختر طريقة عرض النتائج
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
            aria-label="إغلاق"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <ul className="px-2 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {sortOptions.map((option) => {
            const selected = currentSort === option.value
            return (
              <li key={option.value}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-sm transition-colors",
                    selected
                      ? "bg-primary/8 font-semibold text-primary"
                      : "text-foreground hover:bg-muted/60"
                  )}
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-primary" strokeWidth={2.5} />
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border border-border" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </SheetContent>
    </Sheet>
  )
}

function FilterSheet({
  open,
  onOpenChange,
  query,
  pending,
  onApply,
  catalogProjects,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: ListingQuery
  pending: boolean
  onApply: (query: ListingQuery) => void
  catalogProjects?: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>
}) {
  const [draft, setDraft] = useState<ListingsFilterDraft>(() =>
    draftFromQuery(query)
  )

  const onOpen = (next: boolean) => {
    if (next) setDraft(draftFromQuery(query))
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={onOpen}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex max-h-[88vh] flex-col gap-0 rounded-t-2xl border-border p-0"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" aria-hidden />
        <SheetHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-border px-4 py-3 text-start">
          <div>
            <SheetTitle className="text-base font-semibold text-foreground">
              تصفية النتائج
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              حدّد الشروط ثم اعرض النتائج
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
            aria-label="إغلاق"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <ListingsFilterFields
            value={draft}
            onChange={setDraft}
            category={query.category}
            catalogProjects={catalogProjects}
          />
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 gap-1.5"
            onClick={() => setDraft(emptyFilterDraft())}
            disabled={pending}
          >
            <RotateCcw className="size-3.5" />
            إعادة ضبط
          </Button>
          <Button
            type="button"
            className="h-11 flex-[1.35] gap-1.5"
            onClick={() =>
              onApply({
                ...query,
                ...draftToQueryPatch(draft),
              })
            }
            disabled={pending}
          >
            <Search className="size-3.5" />
            عرض النتائج
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
