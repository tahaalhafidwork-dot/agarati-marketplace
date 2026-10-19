"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { ListingStatus } from "@prisma/client"

import {
  parseListingForm,
  validateListingFormCore,
} from "@/application/listings/commands/parse-listing-form"
import { resolveListingComplexFields } from "@/application/listings/commands/resolve-listing-complex"
import {
  collectListingImageFiles,
  uploadListingImages,
} from "@/application/listings/commands/upload-listing-images"
import type { ListingActionState } from "@/application/listings/commands/types"
import { requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { categoryToPrisma, dealToPrisma } from "@/lib/listings"
import { isDealAllowedForCategory, dailyNotAllowedMessage } from "@/lib/deals"
import { assertListingQuota } from "@/lib/listing-quota"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { encodeLandUseMeta, parseLandUseMeta } from "@/lib/land-uses"

export type { ListingActionState, ContactMethod } from "@/application/listings/commands/types"

export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة. راجع docs/SUPABASE_SETUP.md" }
  }

  try {
    const user = await requireSessionUser()
    const quota = await assertListingQuota(user.id, {
      accountType: user.accountType,
      agencyUpgradeStatus: user.agencyUpgradeStatus,
    })
    if (!quota.ok) return { error: quota.error }

    const data = parseListingForm(formData)
    const coreError = validateListingFormCore(data, "create")
    if (coreError) return { error: coreError }
    if (!categoryToPrisma[data.category] || !dealToPrisma[data.deal]) {
      return { error: "نوع العقار أو الصفقة غير صالح." }
    }
    if (!isDealAllowedForCategory(data.category, data.deal)) {
      return { error: dailyNotAllowedMessage(data.category) }
    }

    if (data.phone || data.whatsapp) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: data.phone ?? undefined,
          whatsapp: data.whatsapp ?? undefined,
        },
      })
    }

    const filesOrErr = collectListingImageFiles(formData)
    if ("error" in filesOrErr) return { error: filesOrErr.error }
    const files = filesOrErr

    const complexRes = await resolveListingComplexFields(data, user.id)
    if ("error" in complexRes) return { error: complexRes.error }

    const forcePending = Boolean(complexRes.proposedComplexName)
    const status: ListingStatus =
      data.publish || forcePending ? "PENDING" : "DRAFT"

    const lockKey = [
      user.id,
      data.title,
      String(data.priceIqd),
      data.citySlug,
      data.districtSlug,
      data.neighborhoodSlug,
    ].join("|")
    const listing = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`
      const cutoff = new Date(Date.now() - 20_000)
      const existing = await tx.listing.findFirst({
        where: {
          ownerId: user.id,
          title: data.title,
          priceIqd: data.priceIqd,
          citySlug: data.citySlug,
          districtSlug: data.districtSlug,
          neighborhoodSlug: data.neighborhoodSlug,
          createdAt: { gte: cutoff },
        },
        select: { id: true },
      })
      if (existing) return { id: existing.id, created: false as const }
      const created = await tx.listing.create({
        data: {
          title: data.title,
          description: data.description,
          category: categoryToPrisma[data.category],
          deal: dealToPrisma[data.deal],
          priceIqd: data.priceIqd,
          rooms: data.rooms,
          roomCount: data.roomCount,
          areaM2: data.areaM2,
          floor: data.floor,
          floorNumber: data.floorNumber,
          propertyFloors: data.propertyFloors,
          buildingFloors: data.buildingFloors,
          heating: data.heating,
          furnished: data.furnished,
          meta: data.landUse ? encodeLandUseMeta(data.landUse) : null,
          citySlug: data.citySlug,
          districtSlug: data.districtSlug,
          neighborhoodSlug: data.neighborhoodSlug,
          complexSlug: complexRes.complexSlug,
          proposedComplexName: complexRes.proposedComplexName,
          streetPrivate: data.streetPrivate,
          contactMethod: data.contactMethod,
          mapLat: data.mapLat,
          mapLng: data.mapLng,
          services: data.services,
          status,
          ownerId: user.id,
          publishedAt: null,
          expiresAt: null,
        },
        select: { id: true },
      })
      return { id: created.id, created: true as const }
    })

    if (listing.created && files.length) {
      await uploadListingImages(listing.id, user.id, files)
    }

    revalidatePath("/dashboard/properties")
    revalidatePath("/properties")
    revalidatePath("/")
    redirect(`/dashboard/properties`)
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e
    const msg = e instanceof Error ? e.message : "تعذر حفظ الإعلان"
    if (msg === "UNAUTHORIZED") return { error: "يجب تسجيل الدخول." }
    return { error: msg }
  }
}

export async function updateListingAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة. راجع docs/SUPABASE_SETUP.md" }
  }

  try {
    const user = await requireSessionUser()
    const listingId = String(formData.get("listingId") ?? "").trim()
    if (!listingId) return { error: "معرّف الإعلان مفقود." }

    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, ownerId: true, status: true, meta: true },
    })
    if (!existing || existing.ownerId !== user.id) {
      return { error: "لا يمكنك تعديل هذا الإعلان." }
    }

    const ownerId = existing.ownerId

    const data = parseListingForm(formData)
    const coreError = validateListingFormCore(data, "update")
    if (coreError) return { error: coreError }
    if (!categoryToPrisma[data.category] || !dealToPrisma[data.deal]) {
      return { error: "نوع العقار أو الصفقة غير صالح." }
    }
    if (!isDealAllowedForCategory(data.category, data.deal)) {
      return { error: dailyNotAllowedMessage(data.category) }
    }

    if (data.phone || data.whatsapp) {
      await prisma.user.update({
        where: { id: ownerId },
        data: {
          phone: data.phone ?? undefined,
          whatsapp: data.whatsapp ?? undefined,
        },
      })
    }

    const filesOrErr = collectListingImageFiles(formData)
    if ("error" in filesOrErr) return { error: filesOrErr.error }
    const files = filesOrErr

    const complexRes = await resolveListingComplexFields(data, ownerId)
    if ("error" in complexRes) return { error: complexRes.error }

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        title: data.title,
        description: data.description,
        category: categoryToPrisma[data.category],
        deal: dealToPrisma[data.deal],
        priceIqd: data.priceIqd,
        rooms: data.rooms,
        roomCount: data.roomCount,
        areaM2: data.areaM2,
        floor: data.floor,
        floorNumber: data.floorNumber,
        propertyFloors: data.propertyFloors,
        buildingFloors: data.buildingFloors,
        heating: data.heating,
        furnished: data.furnished,
        meta:
          data.category === "land" && data.landUse
            ? encodeLandUseMeta(data.landUse)
            : parseLandUseMeta(existing.meta)
              ? null
              : undefined,
        citySlug: data.citySlug,
        districtSlug: data.districtSlug,
        neighborhoodSlug: data.neighborhoodSlug,
        complexSlug: complexRes.complexSlug,
        proposedComplexName: complexRes.proposedComplexName,
        streetPrivate: data.streetPrivate,
        contactMethod: data.contactMethod,
        mapLat: data.mapLat,
        mapLng: data.mapLng,
        services: data.services,
        status: "PENDING",
        publishedAt: null,
        expiresAt: null,
        moderationNote: null,
      },
    })

    if (files.length) {
      await uploadListingImages(listingId, ownerId, files)
    }

    revalidatePath("/dashboard/properties")
    revalidatePath(`/dashboard/properties/${listingId}/edit`)
    revalidatePath(`/properties/${listingId}`)
    revalidatePath("/properties")
    revalidatePath("/admin/properties")
    revalidatePath("/")
    redirect(`/dashboard/properties?notice=review`)
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e
    const msg = e instanceof Error ? e.message : "تعذر تحديث الإعلان"
    if (msg === "UNAUTHORIZED") return { error: "يجب تسجيل الدخول." }
    return { error: msg }
  }
}
