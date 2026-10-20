import type { PublicListingCard } from "@/lib/listings"

/**
 * Rewrite loopback media URLs so a physical device can load them over LAN.
 * Uses the Host of the incoming mobile API request when possible.
 */
export function publicOriginFromRequest(request?: Request): string {
  if (request) {
    try {
      const url = new URL(request.url)
      const host = request.headers.get("x-forwarded-host") || url.host
      const proto =
        request.headers.get("x-forwarded-proto") ||
        url.protocol.replace(":", "") ||
        "http"
      if (host && !host.startsWith("127.") && host !== "localhost") {
        return `${proto}://${host}`.replace(/\/$/, "")
      }
      // Dev: prefer LAN hint if the client called via LAN already
      if (host) return `${proto}://${host}`.replace(/\/$/, "")
    } catch {
      /* fall through */
    }
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:3000"
  )
}

function rewriteLoopbackHost(src: string, requestHost: string): string {
  try {
    const u = new URL(src)
    if (u.hostname === "127.0.0.1" || u.hostname === "localhost") {
      const deviceHost = requestHost.replace(/:\d+$/, "")
      // Keep original port (e.g. Supabase 54321)
      u.hostname = deviceHost
      return u.toString()
    }
  } catch {
    /* ignore */
  }
  return src
}

function absoluteMedia(src: string, origin: string, request?: Request): string {
  if (!src) return src
  let out = src
  if (out.startsWith("/")) {
    out = `${origin}${out}`
  }
  if (request) {
    try {
      const host =
        request.headers.get("x-forwarded-host") || new URL(request.url).host
      const hostname = host.split(":")[0]
      if (hostname && hostname !== "127.0.0.1" && hostname !== "localhost") {
        out = rewriteLoopbackHost(out, hostname)
      }
    } catch {
      /* ignore */
    }
  }
  return out
}

/** Shared DTO for `/api/mobile/v1/listings*` — no business rules. */
export function serializeListingForMobile(
  card: PublicListingCard,
  request?: Request
) {
  const origin = publicOriginFromRequest(request)
  const image = absoluteMedia(card.image, origin, request)
  return {
    id: card.id,
    slug: card.slug,
    title: card.title,
    area: card.area,
    location: {
      city: card.location.city,
      district: card.location.district,
      neighborhood: card.location.neighborhood,
      complex: card.location.complex,
      complexLabel: card.location.complexLabel,
      street: card.location.street,
      label: card.area,
    },
    price: card.price,
    meta: card.meta,
    rooms: card.rooms,
    roomCount: card.roomCount,
    areaM2: card.areaM2,
    floor: card.floor,
    floorNumber: card.floorNumber,
    propertyFloors: card.propertyFloors,
    buildingFloors: card.buildingFloors,
    deal: card.deal,
    category: card.category,
    type: card.type,
    date: card.date,
    image,
    images: (card.images?.length ? card.images : [card.image]).map((u) =>
      absoluteMedia(u, origin, request)
    ),
    description: card.description,
    heating: card.heating,
    furnished: card.furnished,
    ownerPhone: card.ownerPhone ?? null,
    ownerWhatsapp: card.ownerWhatsapp ?? null,
    ownerName: card.ownerName,
    ownerSlug: card.ownerSlug,
    ownerKind: card.ownerKind,
    isDemo: card.isDemo,
    listingNumber: card.listingNumber,
    contactMethod: card.contactMethod,
    mapLat: card.mapLat ?? null,
    mapLng: card.mapLng ?? null,
    services: card.services ?? [],
  }
}
