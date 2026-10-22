"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { buildPropertiesHref, type ListingQuery } from "@/lib/listing-query"
import { cn } from "@/lib/utils"

/** Classifieds search — digits → listing #, alphanumeric (7L94I) → listing #, words → title. */
export function HomeSearchBar({
  className,
  initialQuery = "",
  baseQuery,
}: {
  className?: string
  initialQuery?: string
  baseQuery?: Partial<ListingQuery> & { view?: "list" | "map" }
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const go = (raw: string) => {
    const trimmed = raw.trim()
    router.push(buildPropertiesHref({ ...baseQuery, q: trimmed || undefined }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    go(query)
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="group flex w-full items-center gap-1.5 rounded-2xl border border-border/70 bg-gradient-to-l from-card via-card to-[#faf6ef] p-1.5 shadow-[0_10px_36px_rgba(15,39,68,0.07)] transition focus-within:border-brand-gold/45 focus-within:shadow-[0_12px_40px_rgba(15,39,68,0.1)]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-background/70 px-3 ring-1 ring-transparent transition group-focus-within:ring-brand-gold/25">
          <Input
            className={cn(
              "h-11 flex-1 border-0 bg-transparent px-0 text-sm shadow-none",
              "placeholder:text-muted-foreground/75 focus-visible:ring-0"
            )}
            placeholder="ابحث برقم الإعلان أو بكلمات من العنوان…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="بحث في الإعلانات"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="مسح"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          aria-label="بحث"
          onClick={(event) => {
            event.preventDefault()
            go(query)
          }}
          className={cn(
            "relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full",
            "bg-[#0F2744] text-[color:var(--brand-gold)]",
            "ring-1 ring-[color:var(--brand-gold)]/55",
            "shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_10px_20px_-10px_rgba(15,39,68,0.55)]",
            "transition active:scale-[0.96]"
          )}
        >
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent"
            aria-hidden
          />
          <Search className="relative size-5" strokeWidth={1.75} />
        </button>
      </form>
      {/* Reserved for sponsored / banner ads */}
      <div
        className="mt-2 flex min-h-11 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/25 px-3 py-2"
        aria-label="مساحة إعلانية"
        data-ad-slot="home-search-banner"
      >
        <p className="text-center text-[0.65rem] text-muted-foreground/80">
          مساحة إعلانية · قريباً
        </p>
      </div>
    </div>
  )
}
