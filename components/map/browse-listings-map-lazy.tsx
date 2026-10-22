"use client"

import dynamic from "next/dynamic"

import type { BrowseMapListing } from "@/components/map/browse-listings-map"

const BrowseListingsMap = dynamic(
  () =>
    import("@/components/map/browse-listings-map").then(
      (m) => m.BrowseListingsMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(62vh,28rem)] items-center justify-center bg-muted text-xs text-muted-foreground">
        جاري تحميل الخريطة…
      </div>
    ),
  }
)

export function BrowseListingsMapLazy({
  listings,
  listHref,
  className,
}: {
  listings: BrowseMapListing[]
  listHref: string
  className?: string
}) {
  return (
    <BrowseListingsMap
      listings={listings}
      listHref={listHref}
      className={className}
    />
  )
}
