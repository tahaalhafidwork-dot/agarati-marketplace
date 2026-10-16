"use client"

import { useEffect, useId, useRef } from "react"
import { Shield } from "lucide-react"
import type { Map as LeafletMap } from "leaflet"

import type { ApproximateMapPoint } from "@/lib/map-geo"
import { ensureLeaflet } from "@/lib/leaflet-loader"
import { cn } from "@/lib/utils"

type Props = {
  point: ApproximateMapPoint
  className?: string
  compact?: boolean
}

/** OpenStreetMap area preview — circle only, zoom capped. */
export function ApproximateAreaMap({ point, className, compact }: Props) {
  const mapId = useId().replace(/:/g, "")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null

    async function mount() {
      const L = await ensureLeaflet()
      if (cancelled || !containerRef.current) return

      containerRef.current.innerHTML = ""
      containerRef.current.style.height = "240px"
      containerRef.current.style.width = "100%"

      map = L.map(containerRef.current, {
        center: [point.center.lat, point.center.lng],
        zoom: point.zoom,
        minZoom: 10,
        maxZoom: point.maxZoom,
        scrollWheelZoom: false,
      })

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: point.maxZoom,
      }).addTo(map)

      const circle = L.circle([point.center.lat, point.center.lng], {
        radius: point.radiusM,
        color: "#0F2744",
        weight: 2,
        fillColor: "#B8956C",
        fillOpacity: 0.28,
        opacity: 0.85,
      }).addTo(map)

      L.circleMarker([point.center.lat, point.center.lng], {
        radius: 7,
        color: "#fff",
        weight: 2,
        fillColor: "#0F2744",
        fillOpacity: 1,
      }).addTo(map)

      try {
        map.fitBounds(circle.getBounds(), {
          padding: [28, 28],
          maxZoom: point.maxZoom,
        })
      } catch {
        /* ignore */
      }

      requestAnimationFrame(() => map?.invalidateSize())
      setTimeout(() => map?.invalidateSize(), 200)
    }

    void mount()
    return () => {
      cancelled = true
      map?.remove()
    }
  }, [
    point.center.lat,
    point.center.lng,
    point.radiusM,
    point.zoom,
    point.maxZoom,
  ])

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border", className)}>
      <div
        ref={containerRef}
        id={`agarati-map-${mapId}`}
        className="agarati-leaflet-map h-60 w-full bg-[#cfd8e3]"
        role="img"
        aria-label={`خريطة تقريبية لـ ${point.label}`}
      />
      {!compact ? (
        <div className="flex items-start gap-2 border-t border-border bg-[#faf6ef] px-3 py-2.5">
          <Shield className="mt-0.5 size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
          <p className="text-[0.7rem] leading-5 text-muted-foreground">
            الموقع تقريبي لحماية الخصوصية — لا نعرض عنوان الشارع ولا إبرة دقيقة.
          </p>
        </div>
      ) : null}
    </div>
  )
}
