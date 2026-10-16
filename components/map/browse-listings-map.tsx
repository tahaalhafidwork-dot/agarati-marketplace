"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { List, MapPin, Shield, X } from "lucide-react"
import type { Map as LeafletMap } from "leaflet"

import {
  ListingResultRow,
  type ListingResultRowData,
} from "@/components/property/listing-result-row"
import type { ApproximateMapPoint } from "@/lib/map-geo"
import { cn } from "@/lib/utils"
import { ensureLeaflet } from "@/lib/leaflet-loader"

export type BrowseMapListing = ListingResultRowData & {
  point: ApproximateMapPoint
}

type Props = {
  listings: BrowseMapListing[]
  listHref: string
  className?: string
}

type MarkerLike = {
  setStyle: (s: Record<string, unknown>) => void
}

const FALLBACK: [number, number] = [33.3152, 44.3661]

/** Approximate OSM map for filtered results + floating preview strip. */
export function BrowseListingsMap({ listings, listHref, className }: Props) {
  const router = useRouter()
  const mapId = useId().replace(/:/g, "")
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, MarkerLike>>(new Map())
  const listingsRef = useRef(listings)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    listingsRef.current = listings
  }, [listings])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const listingsKey = useMemo(
    () =>
      listings
        .map(
          (l) =>
            `${l.id}:${Number(l.point.center.lat).toFixed(5)}:${Number(l.point.center.lng).toFixed(5)}`
        )
        .join("|"),
    [listings]
  )

  const selected = useMemo(
    () => listings.find((l) => l.id === selectedId) ?? null,
    [listings, selectedId]
  )

  const [mapKey, setMapKey] = useState(listingsKey)
  if (listingsKey !== mapKey) {
    setMapKey(listingsKey)
    setStatus("loading")
    setErrorMsg(null)
    setSelectedId(null)
  } else if (selectedId && !listings.some((l) => l.id === selectedId)) {
    setSelectedId(null)
  }

  useEffect(() => {
    let cancelled = false

    async function mount() {
      try {
        const L = await ensureLeaflet()
        if (cancelled || !containerRef.current) return

        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
        markersRef.current.clear()
        containerRef.current.innerHTML = ""

        const el = containerRef.current
        const hostH = el.parentElement?.clientHeight || 0
        el.style.height = `${hostH > 200 ? hostH : 420}px`
        el.style.width = "100%"

        const seedLatLngs: [number, number][] = []
        for (const item of listings) {
          const lat = Number(item.point?.center?.lat)
          const lng = Number(item.point?.center?.lng)
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            seedLatLngs.push([lat, lng])
          }
        }

        const startCenter = seedLatLngs[0] ?? FALLBACK

        const map = L.map(el, {
          center: startCenter,
          zoom: seedLatLngs.length === 1 ? 13 : 11,
          minZoom: 7,
          maxZoom: 14,
          scrollWheelZoom: true,
        })

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 14,
        }).addTo(map)

        const latLngs: [number, number][] = []

        for (const item of listings) {
          const lat = Number(item.point?.center?.lat)
          const lng = Number(item.point?.center?.lng)
          const radiusM = Number(item.point?.radiusM) || 800
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

          latLngs.push([lat, lng])

          const openPreview = () => {
            setSelectedId((prev) => {
              // Second click on same pin → open listing
              if (prev === item.id) {
                router.push(item.href)
                return prev
              }
              return item.id
            })
          }

          L.circle([lat, lng], {
            radius: radiusM,
            color: "#0F2744",
            weight: 2,
            fillColor: "#B8956C",
            fillOpacity: 0.28,
            opacity: 0.9,
          })
            .on("click", openPreview)
            .addTo(map)

          const marker = L.circleMarker([lat, lng], {
            radius: 10,
            color: "#ffffff",
            weight: 2,
            fillColor: "#0F2744",
            fillOpacity: 1,
          })
            .on("click", openPreview)
            .addTo(map)

          markersRef.current.set(item.id, marker)
        }

        function fitToListings() {
          if (!latLngs.length) {
            map.setView(FALLBACK, 11)
            return
          }
          if (latLngs.length === 1) {
            map.setView(latLngs[0], 13)
            return
          }
          const bounds = L.latLngBounds(latLngs)
          // Pad so privacy circles stay inside the viewport
          map.fitBounds(bounds.pad(0.35), {
            padding: [56, 56],
            maxZoom: 13,
          })
        }

        fitToListings()
        mapRef.current = map
        if (!cancelled) setStatus("ready")

        // invalidateSize after layout — then re-fit (fixes far-away first paint)
        const syncView = () => {
          try {
            map.invalidateSize(true)
            fitToListings()
          } catch {
            /* ignore */
          }
        }
        requestAnimationFrame(syncView)
        setTimeout(syncView, 80)
        setTimeout(syncView, 280)
        setTimeout(syncView, 600)
      } catch (err) {
        console.error("[agarati-map]", err)
        if (!cancelled) {
          setStatus("error")
          setErrorMsg(
            err instanceof Error ? err.message : "تعذّر تحميل الخريطة"
          )
        }
      }
    }

    void mount()

    const markers = markersRef.current
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markers.clear()
    }
    // listings captured via listingsKey; re-run when coords change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingsKey, router])

  // Highlight + pan when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const active = id === selectedId
      marker.setStyle({
        radius: active ? 13 : 10,
        fillColor: active ? "#B8956C" : "#0F2744",
        color: "#ffffff",
        weight: 2,
      })
    })

    if (!selectedId || !mapRef.current) return
    const item = listingsRef.current.find((l) => l.id === selectedId)
    if (!item) return
    const lat = Number(item.point.center.lat)
    const lng = Number(item.point.center.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    mapRef.current.panTo([lat, lng], { animate: true })
  }, [selectedId])

  return (
    <div className={cn("relative flex flex-col", className)}>
      <div className="relative h-[min(70vh,560px)] min-h-[420px] w-full md:h-[560px]">
        <div
          ref={containerRef}
          id={`agarati-browse-map-${mapId}`}
          className="agarati-leaflet-map absolute inset-0 z-0 h-full w-full bg-[#cfd8e3]"
        />

        {status === "loading" ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#cfd8e3]/85 text-xs text-muted-foreground">
            جاري تحميل الخريطة ورسم {listings.length} موقعاً…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#cfd8e3] px-4 text-center text-sm text-destructive">
            <p>تعذّر عرض الخريطة</p>
            {errorMsg ? (
              <p className="text-xs text-muted-foreground">{errorMsg}</p>
            ) : null}
          </div>
        ) : null}

        {/* Top chrome */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start gap-2 p-2">
          <div className="pointer-events-auto flex min-w-0 flex-1 items-start gap-2 rounded-xl border border-border/80 bg-card/95 px-2.5 py-2 shadow-sm backdrop-blur-sm">
            <Shield className="mt-0.5 size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
            <p className="flex-1 text-[0.65rem] leading-4 text-muted-foreground">
              مواقع تقريبية — اضغط موقعاً للمعاينة، واضغط مجدداً لفتح الإعلان.
            </p>
          </div>
          <Link
            href={listHref}
            className="pointer-events-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-[0.65rem] font-semibold text-primary shadow-sm"
          >
            <List className="size-3" />
            القائمة
          </Link>
        </div>

        {/* Floating listing preview on the map */}
        {selected ? (
          <div className="absolute inset-x-0 bottom-0 z-20 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_-8px_28px_rgba(15,39,68,0.14)]">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-1.5">
                <p className="text-[0.65rem] font-medium text-muted-foreground">
                  اضغط الشريط أو الموقع مجدداً لفتح الإعلان
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="إغلاق"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <ListingResultRow
                item={selected}
                selected
                onActivate={() => router.push(selected.href)}
                className="bg-card"
              />
            </div>
          </div>
        ) : status === "ready" && listings.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 text-[0.7rem] text-muted-foreground shadow-sm backdrop-blur-sm">
              <MapPin className="size-3.5 text-brand-gold" />
              {listings.length} موقع تقريبي — اختر أحدها
            </p>
          </div>
        ) : null}
      </div>

      {listings.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
          لا نتائج مُصفّاة لعرضها على الخريطة.
        </p>
      ) : null}
    </div>
  )
}
