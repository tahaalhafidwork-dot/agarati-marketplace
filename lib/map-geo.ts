import type { LocationRef } from "@/lib/locations"

export type LatLng = { lat: number; lng: number }

export type ApproximateMapPoint = {
  /** Fuzzed center — never an exact street coordinate */
  center: LatLng
  /** Privacy radius in meters (area, not a pin) */
  radiusM: number
  /** Default / max zoom — capped for privacy */
  zoom: number
  maxZoom: number
  label: string
  precision: "city" | "district" | "neighborhood"
}

/** City-level centroids (approximate public centers). */
const CITY_CENTERS: Record<string, LatLng> = {
  erbil: { lat: 36.1911, lng: 44.0092 },
  baghdad: { lat: 33.3152, lng: 44.3661 },
  sulaymaniyah: { lat: 35.555, lng: 45.432 },
  basra: { lat: 30.5085, lng: 47.7804 },
  mosul: { lat: 36.3489, lng: 43.157 },
  kirkuk: { lat: 35.4681, lng: 44.3922 },
  najaf: { lat: 31.9996, lng: 44.3302 },
  karbala: { lat: 32.616, lng: 44.024 },
}

/** Known district offsets from city center (degrees ≈ rough km). */
const DISTRICT_OFFSETS: Record<string, LatLng> = {
  "erbil:erbil-center": { lat: 0.01, lng: 0.01 },
  "erbil:kesnazan": { lat: 0.04, lng: 0.05 },
  "erbil:baharka": { lat: 0.08, lng: 0.02 },
  "erbil:bastora": { lat: 0.06, lng: -0.04 },
  "erbil:qashtapa": { lat: -0.05, lng: 0.03 },
  "erbil:kirkuk-road": { lat: -0.07, lng: 0.05 },
  "erbil:shaqlawa": { lat: 0.22, lng: 0.18 },
  "erbil:koya": { lat: 0.15, lng: 0.35 },
  "erbil:soran": { lat: 0.45, lng: 0.35 },
  "baghdad:karkh": { lat: 0.01, lng: -0.04 },
  "baghdad:rusafa": { lat: 0.01, lng: 0.04 },
  "baghdad:madaen": { lat: -0.08, lng: 0.06 },
  "baghdad:abu-ghraib": { lat: 0.02, lng: -0.18 },
  "baghdad:taji": { lat: 0.18, lng: -0.05 },
  "baghdad:mahmudiya": { lat: -0.2, lng: -0.05 },
  "sulaymaniyah:sulaymaniyah-center": { lat: 0.01, lng: 0.01 },
  "sulaymaniyah:ranya": { lat: 0.55, lng: -0.15 },
  "sulaymaniyah:halabja": { lat: -0.35, lng: 0.25 },
  "basra:basra-center": { lat: 0.01, lng: 0.01 },
  "mosul:mosul-left": { lat: 0.02, lng: 0.03 },
  "mosul:mosul-right": { lat: 0.02, lng: -0.03 },
  "kirkuk:kirkuk-center": { lat: 0.01, lng: 0.01 },
  "najaf:najaf-center": { lat: 0.01, lng: 0.01 },
  "karbala:karbala-center": { lat: 0.01, lng: 0.01 },
}

/** Well-known neighborhood offsets within districts (still coarse). */
const NEIGHBORHOOD_OFFSETS: Record<string, LatLng> = {
  "erbil:erbil-center:ankawa": { lat: 0.035, lng: 0.04 },
  "erbil:erbil-center:gulan": { lat: 0.02, lng: -0.01 },
  "erbil:erbil-center:daratoo": { lat: -0.015, lng: 0.02 },
  "erbil:erbil-center:downtown": { lat: 0.005, lng: 0.005 },
  "erbil:erbil-center:bakhtyari": { lat: 0.015, lng: -0.02 },
  "baghdad:karkh:mansour": { lat: 0.02, lng: -0.05 },
  "baghdad:karkh:yarmouk": { lat: 0.015, lng: -0.06 },
  "baghdad:rusafa:karrada": { lat: -0.01, lng: 0.04 },
  "baghdad:rusafa:jadriya": { lat: -0.025, lng: 0.035 },
  "baghdad:rusafa:zinouna": { lat: 0.005, lng: 0.055 },
}

const MAX_ZOOM = 14
const DEFAULT_ZOOM_CITY = 12
const DEFAULT_ZOOM_DISTRICT = 13
const DEFAULT_ZOOM_NEIGHBORHOOD = 14

/** Privacy radius — wide enough that a house cannot be identified. */
const RADIUS_CITY_M = 2500
const RADIUS_DISTRICT_M = 1200
const RADIUS_NEIGHBORHOOD_M = 700

function hash01(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 0xffffffff
}

/** Deterministic soft offset in degrees (~hundreds of meters). */
function softOffset(seed: string, maxDeg: number): LatLng {
  const a = hash01(seed)
  const b = hash01(seed + ":b")
  return {
    lat: (a - 0.5) * 2 * maxDeg,
    lng: (b - 0.5) * 2 * maxDeg,
  }
}

function add(a: LatLng, b: LatLng): LatLng {
  return { lat: a.lat + b.lat, lng: a.lng + b.lng }
}

/** Soften exact click coords before public storage (~150–400m). */
export function fuzzPublicCoordinates(
  lat: number,
  lng: number,
  seed: string
): LatLng {
  const off = softOffset(`public:${seed}:${lat.toFixed(3)}:${lng.toFixed(3)}`, 0.004)
  return {
    lat: Number((lat + off.lat).toFixed(5)),
    lng: Number((lng + off.lng).toFixed(5)),
  }
}

/**
 * Prefer stored approximate listing coords when present.
 */
export function pointFromStoredCoords(
  lat: number | null | undefined,
  lng: number | null | undefined,
  opts?: { label?: string; seed?: string }
): ApproximateMapPoint | null {
  if (lat == null || lng == null) return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return {
    center: { lat, lng },
    radiusM: RADIUS_NEIGHBORHOOD_M,
    zoom: DEFAULT_ZOOM_NEIGHBORHOOD,
    maxZoom: MAX_ZOOM,
    label: opts?.label ?? "المنطقة التقريبية",
    precision: "neighborhood",
  }
}

export const OSM_TILE_URL =
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/** Always returns a usable point — falls back to Baghdad if city unknown. */
export function resolveApproximateMapPoint(
  loc: LocationRef | null | undefined,
  opts?: { seed?: string; label?: string }
): ApproximateMapPoint {
  const safeLoc: LocationRef = {
    city: loc?.city || "baghdad",
    district: loc?.district || "",
    neighborhood: loc?.neighborhood || "",
    complex: loc?.complex,
  }

  const city = CITY_CENTERS[safeLoc.city] ?? CITY_CENTERS.baghdad
  const districtKey = `${safeLoc.city}:${safeLoc.district}`
  const neighborhoodKey = `${safeLoc.city}:${safeLoc.district}:${safeLoc.neighborhood}`
  const seed = opts?.seed ?? neighborhoodKey

  let center = city
  let precision: ApproximateMapPoint["precision"] = "city"
  let radiusM = RADIUS_CITY_M
  let zoom = DEFAULT_ZOOM_CITY

  const districtOff =
    DISTRICT_OFFSETS[districtKey] ??
    (safeLoc.district ? softOffset(`district:${districtKey}`, 0.05) : null)

  if (districtOff) {
    center = add(city, districtOff)
    precision = "district"
    radiusM = RADIUS_DISTRICT_M
    zoom = DEFAULT_ZOOM_DISTRICT
  }

  const neighborhoodOff =
    NEIGHBORHOOD_OFFSETS[neighborhoodKey] ??
    (safeLoc.neighborhood
      ? softOffset(`nbhd:${neighborhoodKey}`, 0.02)
      : null)

  if (neighborhoodOff) {
    center = add(center, neighborhoodOff)
    precision = "neighborhood"
    radiusM = RADIUS_NEIGHBORHOOD_M
    zoom = DEFAULT_ZOOM_NEIGHBORHOOD
  }

  center = add(center, softOffset(`listing:${seed}`, 0.008))

  return {
    center,
    radiusM,
    zoom,
    maxZoom: MAX_ZOOM,
    label: opts?.label ?? "المنطقة التقريبية",
    precision,
  }
}
