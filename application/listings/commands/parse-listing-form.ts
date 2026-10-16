import { normalizeIraqPhone } from "@/lib/phone"
import { parseServicesFromForm } from "@/lib/listing-services"
import type { DealType, PropertyCategory } from "@/lib/sample-listings"

export type ContactMethod = "WHATSAPP_PHONE" | "ALL" | "CHAT"

export type ParsedListingForm = {
  title: string
  description: string
  category: PropertyCategory
  deal: DealType
  priceIqd: number
  rooms: string | null
  areaM2: number | null
  floor: string | null
  heating: string | null
  furnished: string | null
  citySlug: string
  districtSlug: string
  neighborhoodSlug: string
  complexSlug: string | null
  proposedComplexName: string | null
  inComplex: boolean
  streetPrivate: string | null
  phone: string | null
  whatsapp: string | null
  contactMethod: ContactMethod
  publish: boolean
  mapLat: number | null
  mapLng: number | null
  services: ReturnType<typeof parseServicesFromForm>
}

export function parseListingForm(formData: FormData): ParsedListingForm {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const category = String(formData.get("category") ?? "") as PropertyCategory
  const deal = String(formData.get("deal") ?? "") as DealType
  const priceRaw = String(formData.get("price") ?? "").replace(/\D/g, "")
  const priceIqd = Number(priceRaw)
  const rooms = String(formData.get("rooms") ?? "").trim() || null
  const areaM2Raw = String(formData.get("areaM2") ?? "").replace(/\D/g, "")
  const areaM2 = areaM2Raw ? Number(areaM2Raw) : null
  const floor = String(formData.get("floor") ?? "").trim() || null
  const heating = String(formData.get("heating") ?? "").trim() || null
  const furnished = String(formData.get("furnished") ?? "").trim() || null
  const citySlug = String(formData.get("city") ?? "").trim()
  const districtSlug = String(formData.get("district") ?? "").trim()
  const neighborhoodSlug = String(formData.get("neighborhood") ?? "").trim()
  const complexSlug = String(formData.get("complex") ?? "").trim() || null
  const proposedComplexName =
    String(formData.get("proposedComplexName") ?? "").trim() || null
  const inComplex = String(formData.get("inComplex") ?? "") === "1"
  const streetPrivate =
    String(formData.get("streetPrivate") ?? "").trim() || null
  const phoneRaw = String(formData.get("phone") ?? "").trim() || null
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim() || phoneRaw
  const phone = phoneRaw ? normalizeIraqPhone(phoneRaw) ?? phoneRaw : null
  const whatsapp = whatsappRaw
    ? normalizeIraqPhone(whatsappRaw) ?? whatsappRaw
    : null
  const contactMethod =
    (String(formData.get("contactMethod") ?? "CHAT") as ContactMethod) ||
    "CHAT"
  const publish = String(formData.get("publish") ?? "") === "1"
  const mapLatRaw = String(formData.get("mapLat") ?? "").trim()
  const mapLngRaw = String(formData.get("mapLng") ?? "").trim()
  const mapLat = mapLatRaw ? Number(mapLatRaw) : null
  const mapLng = mapLngRaw ? Number(mapLngRaw) : null
  const services = parseServicesFromForm(formData)

  return {
    title,
    description,
    category,
    deal,
    priceIqd,
    rooms,
    areaM2,
    floor,
    heating,
    furnished,
    citySlug,
    districtSlug,
    neighborhoodSlug,
    complexSlug,
    proposedComplexName,
    inComplex,
    streetPrivate,
    phone,
    whatsapp,
    contactMethod,
    publish,
    mapLat,
    mapLng,
    services,
  }
}

export function validateListingFormCore(
  data: ParsedListingForm,
  mode: "create" | "update"
): string | null {
  if (
    !data.title ||
    !data.description ||
    !data.citySlug ||
    !data.districtSlug ||
    !data.neighborhoodSlug
  ) {
    return "أكمل العنوان والوصف والموقع."
  }
  if (!data.priceIqd || Number.isNaN(data.priceIqd)) {
    return "أدخل سعراً صحيحاً."
  }
  if (
    data.mapLat == null ||
    data.mapLng == null ||
    !Number.isFinite(data.mapLat) ||
    !Number.isFinite(data.mapLng) ||
    data.mapLat < 29 ||
    data.mapLat > 38 ||
    data.mapLng < 38 ||
    data.mapLng > 49
  ) {
    return mode === "create"
      ? "حدّد موقعاً تقريبياً على الخريطة قبل النشر."
      : "حدّد موقعاً تقريبياً على الخريطة قبل الحفظ."
  }
  if (data.inComplex) {
    if (data.proposedComplexName) {
      if (data.proposedComplexName.trim().length < 2) {
        return "أدخل اسم المجمع المقترح."
      }
    } else if (!data.complexSlug) {
      return "اختر المجمع أو اقترح اسماً جديداً."
    }
  }
  return null
}
