"use client"

import { useTransition } from "react"
import { Eye, EyeOff, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  republishListingAction,
  toggleListingVisibilityAction,
} from "@/lib/actions/listings"

export function ListingVisibilityControls({
  listingId,
  status,
  visibilityPaused,
}: {
  listingId: string
  status: string
  visibilityPaused: boolean
}) {
  const [pending, startTransition] = useTransition()

  if (status === "EXPIRED") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            try {
              await republishListingAction(listingId)
            } catch {
              /* ignore — page revalidates on success */
            }
          })
        }}
      >
        <RotateCcw className="size-3.5" />
        {pending ? "جاري…" : "إعادة نشر"}
      </Button>
    )
  }

  if (status !== "ACTIVE") return null

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await toggleListingVisibilityAction(listingId)
          } catch {
            /* ignore */
          }
        })
      }}
    >
      {visibilityPaused ? (
        <>
          <Eye className="size-3.5" />
          {pending ? "جاري…" : "إظهار"}
        </>
      ) : (
        <>
          <EyeOff className="size-3.5" />
          {pending ? "جاري…" : "إخفاء"}
        </>
      )}
    </Button>
  )
}
