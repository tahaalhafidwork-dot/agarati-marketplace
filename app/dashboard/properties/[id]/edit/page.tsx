import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import {
  NewListingForm,
  type ListingWizardInitial,
} from "@/app/dashboard/properties/new/listing-form"
import { getSessionUser } from "@/lib/auth"
import { listApprovedProjectsForComplexes } from "@/lib/complex-options"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { prismaToCategory, prismaToDeal } from "@/lib/listings"
import type { ContactMethod } from "@/lib/actions/listings"
import {
  inferLegacyFloorValues,
  parseLegacyRoomCount,
} from "@/lib/listing-attributes"

export const metadata: Metadata = {
  title: "تعديل إعلان",
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/login?next=/dashboard/properties/${id}/edit`)
  if (!isDatabaseConfigured()) {
    return (
      <p className="rounded-lg border border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
        اربط قاعدة البيانات أولاً — راجع docs/SUPABASE_SETUP.md
      </p>
    )
  }

  const listing = await prisma.listing.findFirst({
    where: { id },
    include: {
      owner: { select: { id: true, phone: true, whatsapp: true } },
    },
  })
  if (!listing) notFound()
  if (listing.ownerId !== user.id) notFound()

  const category = prismaToCategory[listing.category]
  const legacyFloors = inferLegacyFloorValues(category, listing.floor)

  const initialValues: ListingWizardInitial = {
    listingId: listing.id,
    category,
    deal: prismaToDeal[listing.deal],
    title: listing.title,
    price: String(listing.priceIqd),
    roomCount: String(
      listing.roomCount ?? parseLegacyRoomCount(listing.rooms) ?? ""
    ),
    areaM2: listing.areaM2 != null ? String(listing.areaM2) : "",
    floorNumber: String(
      listing.floorNumber ?? legacyFloors.floorNumber ?? ""
    ),
    propertyFloors: String(
      listing.propertyFloors ?? legacyFloors.propertyFloors ?? ""
    ),
    buildingFloors: String(
      listing.buildingFloors ?? legacyFloors.buildingFloors ?? ""
    ),
    heating: listing.heating ?? "",
    furnished: listing.furnished ?? "",
    services: listing.services ?? [],
    city: listing.citySlug,
    district: listing.districtSlug,
    neighborhood: listing.neighborhoodSlug,
    complex: listing.complexSlug ?? "",
    proposedComplexName: listing.proposedComplexName ?? "",
    streetPrivate: listing.streetPrivate ?? "",
    mapLat: listing.mapLat,
    mapLng: listing.mapLng,
    contactMethod: (listing.contactMethod ?? "ALL") as ContactMethod,
    phone: listing.owner.phone ?? "",
    whatsapp: listing.owner.whatsapp ?? "",
    description: listing.description,
    status: listing.status as ListingWizardInitial["status"],
    moderationNote: listing.moderationNote,
  }

  return (
    <NewListingForm
      initialValues={initialValues}
      catalogProjects={(await listApprovedProjectsForComplexes()).map((p) => ({
        slug: p.slug,
        name: p.name,
        citySlug: p.citySlug,
        districtSlug: p.districtSlug,
        neighborhoodSlug: p.neighborhoodSlug,
      }))}
    />
  )
}
