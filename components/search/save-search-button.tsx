"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Bookmark } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { toggleSavedSearchAction } from "@/lib/actions/saved-searches"
import { cn } from "@/lib/utils"

type Props = {
  href: string
  title: string
  initialSaved?: boolean
  className?: string
  /** Compact icon for AppSubHeader navy chrome */
  chrome?: "navy" | "default"
}

/**
 * Saves the current browse/search list (filters URL), not a single listing.
 * Listing hearts use ListingFavoriteButton separately.
 */
export function SaveSearchButton({
  href,
  title,
  initialSaved = false,
  className,
  chrome = "navy",
}: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onToggle() {
    setError(null)
    startTransition(async () => {
      const result = await toggleSavedSearchAction({ href, title })
      if (result.code === "UNAUTHORIZED") {
        router.push(
          `/login?next=${encodeURIComponent(href || "/properties")}`
        )
        return
      }
      if (result.error) {
        setError(result.error)
        return
      }
      setSaved(Boolean(result.saved))
      router.refresh()
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-label={saved ? "إزالة القائمة من المفضلة" : "حفظ القائمة في المفضلة"}
        aria-pressed={saved}
        title={saved ? "قائمة محفوظة — اضغط للإزالة" : "حفظ قائمة العروض الحالية"}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9 rounded-full",
          chrome === "navy"
            ? "text-primary-foreground/85 hover:bg-white/10 hover:text-[#e8d5b5]"
            : "text-foreground",
          saved &&
            (chrome === "navy"
              ? "text-[#e8d5b5] hover:text-[#e8d5b5]"
              : "text-brand-gold"),
          className
        )}
      >
        <Bookmark
          className="size-4"
          strokeWidth={1.6}
          fill={saved ? "currentColor" : "none"}
        />
      </button>
      {error ? (
        <span className="absolute end-0 top-full z-50 mt-1 w-40 rounded-md bg-card px-2 py-1 text-[0.65rem] text-destructive shadow-md">
          {error}
        </span>
      ) : null}
    </div>
  )
}
