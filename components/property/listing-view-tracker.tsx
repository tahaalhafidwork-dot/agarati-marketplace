"use client"

import { useEffect, useRef } from "react"

import { recordListingViewAction } from "@/lib/actions/listings"

/** Fire-and-forget view increment once per mount for real (non-demo) listings. */
export function ListingViewTracker({
  listingId,
  enabled,
}: {
  listingId: string
  enabled: boolean
}) {
  const done = useRef(false)

  useEffect(() => {
    if (!enabled || done.current) return
    done.current = true
    void recordListingViewAction(listingId)
  }, [enabled, listingId])

  return null
}
