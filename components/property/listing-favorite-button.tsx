"use client"

import { useState, useSyncExternalStore, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Heart } from "lucide-react"

import { toggleFavoriteAction } from "@/lib/actions/listings"
import {
  isLocalFavorite,
  subscribeLocalFavorites,
  toggleLocalFavorite,
  removeLocalFavorite,
} from "@/lib/favorites-local"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  listingId: string
  favorited?: boolean
  isDemo?: boolean
  /** When true, server Favorite is SSOT (ignore guest local leftover). */
  signedIn?: boolean
  size?: "sm" | "default" | "icon" | "icon-sm"
  className?: string
  variant?: "overlay" | "plain"
}

function subscribeFavorites(onStoreChange: () => void) {
  return subscribeLocalFavorites(() => onStoreChange())
}

export function ListingFavoriteButton({
  listingId,
  favorited = false,
  isDemo = false,
  signedIn = false,
  size = "icon-sm",
  className,
  variant = "plain",
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState<boolean | null>(null)
  const [seenKey, setSeenKey] = useState(`${listingId}:${favorited}`)

  const localActive = useSyncExternalStore(
    subscribeFavorites,
    () => isLocalFavorite(listingId),
    () => false
  )

  const key = `${listingId}:${favorited}`
  if (seenKey !== key) {
    setSeenKey(key)
    setOptimistic(null)
  }

  const resolvedActive =
    optimistic ??
    (isDemo
      ? localActive || favorited
      : signedIn
        ? favorited || localActive
        : favorited || localActive)

  return (
    <Button
      type="button"
      variant={variant === "overlay" ? "secondary" : "outline"}
      size={size}
      disabled={pending}
      aria-label={resolvedActive ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      aria-pressed={resolvedActive}
      data-active={resolvedActive ? "true" : "false"}
      className={cn(
        variant === "overlay" && "shadow-sm",
        className,
        // Active styles last so parent chrome (contact bar) cannot hide the heart fill.
        resolvedActive &&
          "border-[color:var(--brand-gold)] bg-[color:var(--brand-gold)]/15 text-[color:var(--brand-gold)] hover:border-[color:var(--brand-gold)] hover:bg-[color:var(--brand-gold)]/20 hover:text-[color:var(--brand-gold)]"
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isDemo) {
          const next = toggleLocalFavorite(listingId)
          setOptimistic(next)
          return
        }

        if (!signedIn) {
          const next = toggleLocalFavorite(listingId)
          setOptimistic(next)
          router.push(
            `/login?next=${encodeURIComponent(
              pathname || `/properties/${listingId}`
            )}`
          )
          return
        }

        const previous = resolvedActive
        setOptimistic(!previous)

        startTransition(async () => {
          const result = await toggleFavoriteAction(listingId)
          if (result.code === "UNAUTHORIZED") {
            setOptimistic(previous)
            router.push(
              `/login?next=${encodeURIComponent(
                pathname || `/properties/${listingId}`
              )}`
            )
            return
          }
          if (result.code === "NOT_FOUND" || result.code === "DB") {
            const next = toggleLocalFavorite(listingId)
            setOptimistic(next)
            return
          }
          if (result.error) {
            setOptimistic(previous)
            window.alert(result.error)
            return
          }
          removeLocalFavorite(listingId)
          setOptimistic(Boolean(result.favorited))
          router.refresh()
        })
      }}
    >
      <Heart
        className={cn(
          size === "icon" ? "size-5" : "size-3.5",
          resolvedActive
            ? "fill-[color:var(--brand-gold)] text-[color:var(--brand-gold)]"
            : "fill-none"
        )}
        strokeWidth={resolvedActive ? 1.5 : 1.75}
        aria-hidden
      />
    </Button>
  )
}
