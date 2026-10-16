import { formatPublicArea } from "@/lib/locations"
import { resolveApproximateMapPoint } from "@/lib/map-geo"

/** Max approved community photos shown in a project gallery. */
export const PROJECT_GALLERY_MAX = 30

export function projectMapsLinks(opts: {
  name: string
  citySlug?: string | null
  districtSlug?: string | null
  neighborhoodSlug?: string | null
}): {
  label: string
  openStreetMap: string
  googleMaps: string
} | null {
  const city = opts.citySlug?.trim()
  if (!city) return null

  const loc = {
    city,
    district: opts.districtSlug?.trim() || "",
    neighborhood: opts.neighborhoodSlug?.trim() || "",
  }
  const point = resolveApproximateMapPoint(loc, {
    seed: `project:${opts.name}:${city}`,
    label: opts.name,
  })
  const { lat, lng } = point.center
  const areaLabel = formatPublicArea({
    city: loc.city,
    district: loc.district || loc.city,
    neighborhood: loc.neighborhood || loc.district || loc.city,
  })
  const q = encodeURIComponent(`${opts.name} ${areaLabel}`)

  return {
    label: areaLabel,
    openStreetMap: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`,
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${q}`,
  }
}
