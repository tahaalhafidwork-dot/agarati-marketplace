"use client"

import { useEffect, useId, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import type {
  Circle as LeafletCircle,
  CircleMarker as LeafletCircleMarker,
  Map as LeafletMap,
} from "leaflet"

import { ensureLeaflet } from "@/lib/leaflet-loader"
import {
  fuzzPublicCoordinates,
  resolveApproximateMapPoint,
} from "@/lib/map-geo"
import type { LocationRef } from "@/lib/locations"
import { cn } from "@/lib/utils"

type Props = {
  location?: Partial<LocationRef>
  value: { lat: number; lng: number } | null
  onChange: (next: { lat: number; lng: number }) => void
  className?: string
}

/**
 * Interactive approximate pin picker for new listings.
 * Stored/public coords are fuzzed — never exact street precision.
 */
export function LocationMapPicker({
  location,
  value,
  onChange,
  className,
}: Props) {
  const mapId = useId().replace(/:/g, "")
  const containerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const [hint, setHint] = useState(
    "اضغط على الخريطة لتحديد موقع تقريبي للإعلان"
  )
  const [picked, setPicked] = useState(Boolean(value))
  const [prevValue, setPrevValue] = useState(value)

  if (value !== prevValue) {
    setPrevValue(value)
    setPicked(Boolean(value))
    if (!value) {
      setHint("اضغط على الخريطة لتحديد موقع تقريبي للإعلان")
    }
  }

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null
    let marker: LeafletCircleMarker | null = null
    let circle: LeafletCircle | null = null

    async function mount() {
      const L = await ensureLeaflet()
      if (cancelled || !containerRef.current) return

      containerRef.current.innerHTML = ""
      containerRef.current.style.height = "280px"
      containerRef.current.style.width = "100%"

      const fallback = resolveApproximateMapPoint({
        city: location?.city || "baghdad",
        district: location?.district || "",
        neighborhood: location?.neighborhood || "",
      })

      const current = valueRef.current
      const start = current ?? fallback.center

      map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom: current ? 13 : fallback.zoom,
        minZoom: 9,
        maxZoom: 14,
        scrollWheelZoom: true,
      })

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 14,
      }).addTo(map)

      circle = L.circle([start.lat, start.lng], {
        radius: 700,
        color: "#0F2744",
        weight: 2,
        fillColor: "#B8956C",
        fillOpacity: 0.25,
      }).addTo(map)

      marker = L.circleMarker([start.lat, start.lng], {
        radius: 9,
        color: "#fff",
        weight: 2,
        fillColor: current ? "#0F2744" : "#6B6560",
        fillOpacity: current ? 1 : 0.55,
      }).addTo(map)

      map.on("click", (ev) => {
        const fuzzed = fuzzPublicCoordinates(
          ev.latlng.lat,
          ev.latlng.lng,
          mapId
        )
        marker?.setLatLng([fuzzed.lat, fuzzed.lng])
        circle?.setLatLng([fuzzed.lat, fuzzed.lng])
        marker?.setStyle({
          fillColor: "#0F2744",
          fillOpacity: 1,
        })
        onChangeRef.current(fuzzed)
        setPicked(true)
        setHint("تم تحديد موقع تقريبي — يمكن تعديله بالضغط مجدداً")
      })

      requestAnimationFrame(() => map?.invalidateSize(true))
      setTimeout(() => map?.invalidateSize(true), 200)
    }

    void mount()
    return () => {
      cancelled = true
      map?.remove()
    }
  }, [location?.city, location?.district, location?.neighborhood, mapId])

  return (
    <div className={cn("space-y-2", className)}>
      <div className="overflow-hidden rounded-xl border border-border">
        <div
          ref={containerRef}
          id={`agarati-picker-${mapId}`}
          className="agarati-leaflet-map h-[280px] w-full bg-[#cfd8e3]"
        />
      </div>
      <p className="flex items-start gap-1.5 text-[0.7rem] leading-5 text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-gold" />
        {hint}. الموقع يُحفظ بشكل تقريبي لحماية الخصوصية (بدون عنوان شارع دقيق).
      </p>
      {picked && value ? (
        <p className="font-mono text-[0.65rem] text-muted-foreground" dir="ltr">
          ≈ {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </p>
      ) : (
        <p className="text-[0.7rem] font-medium text-destructive">
          مطلوب: حدّد موقعاً على الخريطة قبل النشر
        </p>
      )}
    </div>
  )
}
