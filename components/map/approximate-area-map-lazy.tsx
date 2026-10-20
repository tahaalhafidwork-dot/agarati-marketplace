"use client"

import dynamic from "next/dynamic"

import type { ApproximateMapPoint } from "@/lib/map-geo"

const ApproximateAreaMap = dynamic(
  () =>
    import("@/components/map/approximate-area-map").then(
      (m) => m.ApproximateAreaMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-border bg-muted text-xs text-muted-foreground">
        جاري تحميل الخريطة…
      </div>
    ),
  }
)

export function ApproximateAreaMapLazy({
  point,
  className,
  compact,
}: {
  point: ApproximateMapPoint
  className?: string
  compact?: boolean
}) {
  return (
    <ApproximateAreaMap point={point} className={className} compact={compact} />
  )
}
