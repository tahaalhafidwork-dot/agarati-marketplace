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
import {
  CAPACITY_STATUSES,
  INDIVIDUAL_ACTIVE_LISTING_LIMIT,
} from "@/lib/billing-policy"
import {
  assertAgencyPublishingCapacity,
  canManageAgencyListing,
  getActiveAgencyMembership,
} from "@/lib/agency-service"
import { requestIndividualListingPayment } from "@/lib/payment-service"
import { nextPersonalBillingKind } from "@/lib/agency-policy"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { encodeLandUseMeta, parseLandUseMeta } from "@/lib/land-uses"

export type { ListingActionState, ContactMethod } from "@/application/listings/commands/types"

const listingErrorMessages: Record<string, string> = {
  INDIVIDUAL_LISTING_LIMIT_REACHED: "وصلت إلى الحد الفردي: 3 إعلانات نشطة.",
  AGENCY_LISTING_LIMIT_REACHED: "وصلت الوكالة إلى حدها الإجمالي: 30 إعلانًا.",
  AGENCY_MEMBER_QUOTA_REACHED: "وصلت إلى حصتك الحالية من إعلانات الوكالة.",
  AGENCY_SUBSCRIPTION_REQUIRED: "اشتراك الوكالة غير نشط. جدّده قبل نشر عقار وكالة.",
  AGENCY_NOT_APPROVED: "الوكالة غير معتمدة للنشر.",
  AGENCY_MEMBERSHIP_REQUIRED: "لا توجد عضوية وكالة نشطة لهذا الحساب.",
}

export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة. راجع docs/SUPABASE_SETUP.md" }
  }

  try {
    const user = await requireSessionUser()
    const ownership =
      String(formData.get("listingOwnership") ?? "personal") === "agency"
        ? "agency"
        : "personal"
    const membership =
      ownership === "agency"
        ? await getActiveAgencyMembership(user.id)
        : null
    if (ownership === "agency" && !membership) {
      return { error: "لا توجد عضوية وكالة نشطة لهذا الحساب." }
    }

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
          ...(ownership === "agency" && membership
            ? {
                agencyId: membership.agencyId,
                assignedAgentId: user.id,
              }
            : { ownerId: user.id, agencyId: null }),
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

      let billingKind:
        | "PERSONAL_FREE"
        | "PERSONAL_PAID"
        | "AGENCY_INCLUDED"
      let billingState: "READY" | "PAYMENT_REQUIRED" = "READY"
      let agencyId: string | null = null
      let assignedAgentId: string | null = null

      if (ownership === "agency" && membership) {
        await assertAgencyPublishingCapacity(tx, {
          agencyId: membership.agencyId,
          userId: user.id,
        })
        billingKind = "AGENCY_INCLUDED"
        agencyId = membership.agencyId
        assignedAgentId = user.id
      } else {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`personal-capacity:${user.id}`}, 0))`
        await tx.listing.updateMany({
          where: {
            ownerId: user.id,
            agencyId: null,
            status: "ACTIVE",
            expiresAt: { lte: new Date() },
          },
          data: { status: "EXPIRED" },
        })
        const used = await tx.listing.count({
          where: {
            ownerId: user.id,
            agencyId: null,
            status: { in: [...CAPACITY_STATUSES] },
          },
        })
        if (used >= INDIVIDUAL_ACTIVE_LISTING_LIMIT) {
          throw new Error("INDIVIDUAL_LISTING_LIMIT_REACHED")
        }
        const hasFreeListing = await tx.listing.findFirst({
          where: {
            ownerId: user.id,
            agencyId: null,
            billingKind: "PERSONAL_FREE",
          },
          select: { id: true },
        })
        billingKind = nextPersonalBillingKind(Boolean(hasFreeListing))
        billingState = hasFreeListing ? "PAYMENT_REQUIRED" : "READY"
      }

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
          ownerId:
            ownership === "agency" && membership
              ? membership.agency.createdById
              : user.id,
          agencyId,
          assignedAgentId,
          billingKind,
          billingState,
          publishedAt: null,
          expiresAt: null,
        },
        select: { id: true },
      })
      return { id: created.id, created: true as const }
    })

    if (listing.created && ownership === "personal") {
      const created = await prisma.listing.findUnique({
        where: { id: listing.id },
        select: { billingKind: true },
      })
      if (created?.billingKind === "PERSONAL_PAID") {
        await requestIndividualListingPayment(user.id, listing.id)
      }
    }

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
    return { error: listingErrorMessages[msg] ?? msg }
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
      select: {
        id: true,
        ownerId: true,
        status: true,
        meta: true,
        agencyId: true,
        assignedAgentId: true,
        billingKind: true,
        billingState: true,
        expiresAt: true,
      },
    })
    const ownsPersonal =
      Boolean(existing) && !existing?.agencyId && existing?.ownerId === user.id
    const managesAgency = existing
      ? await canManageAgencyListing(user.id, existing)
      : false
    if (!existing || (!ownsPersonal && !managesAgency)) {
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

    const complexRes = await resolveListingComplexFields(data, ownerId)
    if ("error" in complexRes) return { error: complexRes.error }

    const reentersCapacity = !CAPACITY_STATUSES.includes(
      existing.status as (typeof CAPACITY_STATUSES)[number]
    )
    const requiresRenewalPayment =
      !existing.agencyId &&
      existing.billingKind === "PERSONAL_PAID" &&
      existing.expiresAt != null &&
      existing.expiresAt <= new Date()

    await prisma.$transaction(async (tx) => {
      if (reentersCapacity) {
        if (existing.agencyId) {
          await assertAgencyPublishingCapacity(tx, {
            agencyId: existing.agencyId,
            userId: existing.assignedAgentId ?? user.id,
            excludeListingId: existing.id,
          })
        } else {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`personal-capacity:${existing.ownerId}`}, 0))`
          const used = await tx.listing.count({
            where: {
              ownerId: existing.ownerId,
              agencyId: null,
              id: { not: existing.id },
              status: { in: [...CAPACITY_STATUSES] },
            },
          })
          if (used >= INDIVIDUAL_ACTIVE_LISTING_LIMIT) {
            throw new Error("INDIVIDUAL_LISTING_LIMIT_REACHED")
          }
        }
      }

      await tx.listing.update({
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
        billingState: requiresRenewalPayment
          ? "PAYMENT_REQUIRED"
          : existing.billingState,
        assignedAgentId:
          existing.agencyId && !existing.assignedAgentId ? user.id : undefined,
        publishedAt: null,
        moderationApprovedAt: null,
        moderationNote: null,
        },
      })
    })

    if (requiresRenewalPayment) {
      await requestIndividualListingPayment(user.id, listingId)
    }

    if (files.length) {
      await uploadListingImages(listingId, user.id, files)
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
    return { error: listingErrorMessages[msg] ?? msg }
  }
}
