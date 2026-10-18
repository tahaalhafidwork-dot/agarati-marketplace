import type {
  DealType as PrismaDeal,
  PropertyCategory as PrismaCategory,
  PropertyRequest,
  PropertyRequestStatus,
  User,
} from "@prisma/client"

import {
  categoryToPrisma,
  dealToPrisma,
  prismaToCategory,
  prismaToDeal,
} from "@/lib/listings"
import { formatPublicArea, getCity } from "@/lib/locations"
import {
  categoryLabels,
  dealLabels,
  isDealType,
  isPropertyCategory,
  type DealType,
  type PropertyCategory,
} from "@/lib/sample-listings"
import { fromArabicDigits, parseIQD } from "@/lib/listing-query"
import { formatEnglishNumber, toEnglishDigits } from "@/lib/numerals"

export type PropertyRequestCard = {
  id: string
  title: string
  description: string
  category: PropertyCategory | null
  deal: DealType | null
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
  rooms: string | null
  minBudgetIqd: number | null
  maxBudgetIqd: number | null
  minAreaM2: number | null
  maxAreaM2: number | null
  status: PropertyRequestStatus
  createdAt: Date
  updatedAt: Date
  ownerId: string
  ownerName: string
  messageCount: number
  areaLabel: string
  budgetLabel: string
  categoryLabel: string | null
  dealLabel: string | null
}

export const requestStatusLabels: Record<PropertyRequestStatus, string> = {
  PENDING: "قيد المراجعة",
  OPEN: "منشور",
  FULFILLED: "تم التلبية",
  CLOSED: "مغلق",
  REJECTED: "مرفوض",
}

export function formatBudgetRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  const fmt = (n: number) => formatEnglishNumber(n) + " د.ع"
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`
  if (min != null) return `من ${fmt(min)}`
  if (max != null) return `حتى ${fmt(max)}`
  return "ميزانية غير محددة"
}

export function formatAreaRange(
  min: number | null | undefined,
  max: number | null | undefined
): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${min}–${max} م²`
  if (min != null) return `من ${min} م²`
  return `حتى ${max} م²`
}

export function toPropertyRequestCard(
  row: PropertyRequest & {
    user: Pick<User, "id" | "name">
    _count?: { messages: number }
  }
): PropertyRequestCard {
  const category = row.category ? prismaToCategory[row.category] : null
  const deal = row.deal ? prismaToDeal[row.deal] : null
  const areaLabel =
    row.citySlug && row.districtSlug && row.neighborhoodSlug
      ? formatPublicArea({
          city: row.citySlug,
          district: row.districtSlug,
          neighborhood: row.neighborhoodSlug,
        })
      : row.citySlug
        ? (getCity(row.citySlug)?.label ?? row.citySlug)
        : "العراق"

  return {
    id: row.id,
    title: toEnglishDigits(row.title),
    description: toEnglishDigits(row.description),
    category,
    deal,
    citySlug: row.citySlug,
    districtSlug: row.districtSlug,
    neighborhoodSlug: row.neighborhoodSlug,
    rooms: row.rooms ? toEnglishDigits(row.rooms) : null,
    minBudgetIqd: row.minBudgetIqd,
    maxBudgetIqd: row.maxBudgetIqd,
    minAreaM2: row.minAreaM2,
    maxAreaM2: row.maxAreaM2,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ownerId: row.user.id,
    ownerName: row.user.name,
    messageCount: row._count?.messages ?? 0,
    areaLabel,
    budgetLabel: formatBudgetRange(row.minBudgetIqd, row.maxBudgetIqd),
    categoryLabel: category ? categoryLabels[category] : null,
    dealLabel: deal ? dealLabels[deal] : null,
  }
}

export type PropertyRequestInput = {
  title: string
  description: string
  category: PropertyCategory | null
  deal: DealType | null
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
  rooms: string | null
  minBudgetIqd: number | null
  maxBudgetIqd: number | null
  minAreaM2: number | null
  maxAreaM2: number | null
  status?: PropertyRequestStatus
}

export function parsePropertyRequestForm(
  formData: FormData
): PropertyRequestInput & { error?: string } {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const categoryRaw = String(formData.get("category") ?? "").trim()
  const dealRaw = String(formData.get("deal") ?? "").trim()
  const citySlug = String(formData.get("city") ?? "").trim() || null
  const districtSlug = String(formData.get("district") ?? "").trim() || null
  const neighborhoodSlug =
    String(formData.get("neighborhood") ?? "").trim() || null
  const rooms = String(formData.get("rooms") ?? "").trim() || null

  const minBudgetRaw = String(formData.get("minBudget") ?? "").trim()
  const maxBudgetRaw = String(formData.get("maxBudget") ?? "").trim()
  const minAreaRaw = String(formData.get("minArea") ?? "").trim()
  const maxAreaRaw = String(formData.get("maxArea") ?? "").trim()
  const statusRaw = String(formData.get("status") ?? "").trim()

  if (title.length < 8) {
    return {
      title,
      description,
      category: null,
      deal: null,
      citySlug,
      districtSlug,
      neighborhoodSlug,
      rooms,
      minBudgetIqd: null,
      maxBudgetIqd: null,
      minAreaM2: null,
      maxAreaM2: null,
      error: "عنوان الطلب قصير جداً — اكتب ما تبحث عنه بوضوح.",
    }
  }
  if (description.length < 20) {
    return {
      title,
      description,
      category: null,
      deal: null,
      citySlug,
      districtSlug,
      neighborhoodSlug,
      rooms,
      minBudgetIqd: null,
      maxBudgetIqd: null,
      minAreaM2: null,
      maxAreaM2: null,
      error: "التفاصيل قصيرة — أضف مواصفات أوضح لمساعدة المعلنين.",
    }
  }

  const category =
    categoryRaw && isPropertyCategory(categoryRaw) ? categoryRaw : null
  const deal = dealRaw && isDealType(dealRaw) ? dealRaw : null
  const minBudgetIqd = minBudgetRaw ? parseIQD(minBudgetRaw) || null : null
  const maxBudgetIqd = maxBudgetRaw ? parseIQD(maxBudgetRaw) || null : null
  const minAreaM2 = minAreaRaw
    ? Number(fromArabicDigits(minAreaRaw).replace(/[^\d]/g, "")) || null
    : null
  const maxAreaM2 = maxAreaRaw
    ? Number(fromArabicDigits(maxAreaRaw).replace(/[^\d]/g, "")) || null
    : null

  const status: PropertyRequestStatus | undefined =
    statusRaw === "OPEN" ||
    statusRaw === "FULFILLED" ||
    statusRaw === "CLOSED" ||
    statusRaw === "PENDING" ||
    statusRaw === "REJECTED"
      ? statusRaw
      : undefined

  return {
    title: title.slice(0, 120),
    description: description.slice(0, 4000),
    category,
    deal,
    citySlug,
    districtSlug,
    neighborhoodSlug,
    rooms,
    minBudgetIqd,
    maxBudgetIqd,
    minAreaM2,
    maxAreaM2,
    status,
  }
}

export function toPrismaRequestData(input: PropertyRequestInput) {
  return {
    title: input.title,
    description: input.description,
    category: input.category
      ? (categoryToPrisma[input.category] as PrismaCategory)
      : null,
    deal: input.deal ? (dealToPrisma[input.deal] as PrismaDeal) : null,
    citySlug: input.citySlug,
    districtSlug: input.districtSlug,
    neighborhoodSlug: input.neighborhoodSlug,
    rooms: input.rooms,
    minBudgetIqd: input.minBudgetIqd,
    maxBudgetIqd: input.maxBudgetIqd,
    minAreaM2: input.minAreaM2,
    maxAreaM2: input.maxAreaM2,
    ...(input.status ? { status: input.status } : {}),
  }
}

export function buildPropertyRequestsHref(
  params: Record<string, string | undefined>
): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v)
  }
  const qs = sp.toString()
  return qs
    ? `/dashboard/property-requests?${qs}`
    : "/dashboard/property-requests"
}
