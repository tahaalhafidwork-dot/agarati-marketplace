import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { ListingContactBar } from "@/components/property/listing-contact-bar"
import { ListingResultRow } from "@/components/property/listing-result-row"
import { PropertyGallery } from "@/components/property/property-gallery"
import { PropertyDetailTabs } from "@/components/property"
import { ListingAdvertiserLink } from "@/components/property/listing-advertiser-link"
import { ListingShareButton } from "@/components/property/listing-share-button"
import { ListingViewTracker } from "@/components/property/listing-view-tracker"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { formatPublicArea } from "@/lib/locations"
import {
  pointFromStoredCoords,
  resolveApproximateMapPoint,
} from "@/lib/map-geo"
import {
  fetchListingById,
  fetchPublicListings,
} from "@/lib/listing-service"
import { dealLabels } from "@/lib/sample-listings"
import {
  formatBuildingFloors,
  formatPropertyFloors,
} from "@/lib/listing-attributes"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const listing = await fetchListingById(slug)
  if (!listing) return { title: "إعلان غير موجود" }

  const publicArea = formatPublicArea(listing.location)
  const title = `${listing.title} | ${publicArea}`
  const description = `${listing.description.slice(0, 160)}... ${listing.price} · ${dealLabels[listing.deal]} · ${listing.type}`

  return {
    title,
    description,
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      type: "website",
      locale: "ar",
      images: listing.images.length > 0 ? [listing.images[0]] : [listing.image],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: listing.images.length > 0 ? [listing.images[0]] : [listing.image],
    },
    other: {
      "property:price": listing.price,
      "property:deal": listing.deal,
      "property:type": listing.type,
      "property:area": publicArea,
    },
  }
}

export default async function PropertyDetailPage({
  params,
}: PageProps) {
  const { slug } = await params
  const listing = await fetchListingById(slug)
  if (!listing) {
    const viewer = await getSessionUser()
    if (viewer && isDatabaseConfigured()) {
      const owned = await prisma.listing.findFirst({
        where: { id: slug, ownerId: viewer.id },
        select: { id: true, title: true, status: true },
      })
      if (owned) {
        const statusLabel: Record<string, string> = {
          DRAFT: "مسودة",
          PENDING: "قيد المراجعة",
          ACTIVE: "غير ظاهر للعامة",
          REJECTED: "مرفوض",
          EXPIRED: "منتهٍ",
        }
        return (
          <div className="mx-auto w-full max-w-7xl px-4 py-10">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
              <p className="font-semibold">{owned.title}</p>
              <p className="mt-1">
                هذا الإعلان غير ظاهر للعامة حالياً
                {statusLabel[owned.status]
                  ? ` (الحالة: ${statusLabel[owned.status]}).`
                  : "."}{" "}
                الزوار يرون صفحة غير موجودة، وهذا متوقع قبل النشر.
              </p>
              <p className="mt-3 flex flex-wrap gap-3">
                <a
                  href={`/dashboard/properties/${owned.id}/edit`}
                  className="font-medium text-[#0F2744] underline"
                >
                  تعديل الإعلان
                </a>
                <a
                  href="/dashboard/properties"
                  className="font-medium text-[#0F2744] underline"
                >
                  إعلاناتي
                </a>
              </p>
            </div>
          </div>
        )
      }
    }
    notFound()
  }

  const relatedPromise = fetchPublicListings({
    category: listing.category,
    sort: "newest",
  })
  const user = await getSessionUser()
  let favorited = false
  if (user && isDatabaseConfigured()) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: user.id, listingId: listing.id },
      },
    })
    favorited = Boolean(fav)
  }

  const areaLabel = formatPublicArea(listing.location)
  const attributes = [
    { label: "السعر", value: listing.price },
    { label: "تاريخ الإعلان", value: listing.date },
    { label: "رقم الإعلان", value: listing.listingNumber },
    {
      label: "نوع العقار",
      value: `${dealLabels[listing.deal]} · ${listing.type}`,
    },
    { label: "م² (صافي)", value: listing.areaM2 },
    ...(listing.roomCount != null || listing.rooms !== "—"
      ? [{ label: "عدد الغرف", value: listing.rooms }]
      : []),
    ...(listing.floorNumber != null && listing.floor
      ? [{ label: "طابق الوحدة", value: listing.floor }]
      : []),
    ...(listing.propertyFloors != null
      ? [
          {
            label: "عدد طوابق العقار",
            value: formatPropertyFloors(listing.propertyFloors),
          },
        ]
      : []),
    ...(listing.buildingFloors != null
      ? [
          {
            label: "إجمالي طوابق المبنى",
            value: formatBuildingFloors(listing.buildingFloors),
          },
        ]
      : []),
    { label: "التدفئة", value: listing.heating ?? "—" },
    { label: "الأثاث", value: listing.furnished ?? "—" },
    { label: "المنطقة", value: areaLabel },
    {
      label: "الخدمات",
      value:
        listing.services && listing.services.length > 0
          ? listing.services.join(" · ")
          : "—",
    },
  ]

  const gallery = listing.images.length ? listing.images : [listing.image]
  const mapPoint =
    pointFromStoredCoords(listing.mapLat, listing.mapLng, {
      label: areaLabel,
    }) ??
    resolveApproximateMapPoint(listing.location, {
      seed: listing.id,
      label: areaLabel,
    })
  const related = (await relatedPromise)
    .filter((item) => item.id !== listing.id)
    .slice(0, 3)

  const contactProps = {
    listingId: listing.id,
    title: listing.title,
    ownerName: listing.ownerName,
    ownerSlug: listing.ownerSlug,
    ownerKind: listing.ownerKind,
    phone: listing.ownerPhone,
    whatsapp: listing.ownerWhatsapp,
    favorited,
    isDemo: listing.isDemo,
    signedIn: Boolean(user),
    contactMethod: listing.contactMethod,
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-28 md:pb-8">
      <ListingViewTracker
        listingId={listing.id}
        enabled={!listing.isDemo}
      />
      <AppSubHeader
        title="تفاصيل الإعلان"
        backHref={`/properties?type=${listing.category}`}
        actions={
          <ListingShareButton
            title={listing.title}
            text={`${listing.title} · ${listing.price} — أغاراتي`}
            url={`/properties/${listing.id}`}
          />
        }
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-6 lg:px-4 lg:pt-4">
        <div className="min-w-0">
          <PropertyGallery
            images={gallery}
            title={listing.title}
            ownerName={listing.ownerName}
          />

          <div className="border-b border-[color:var(--brand-gold)]/25 bg-white/40 px-3 py-2 backdrop-blur-[6px] lg:hidden">
            <ListingAdvertiserLink
              name={listing.ownerName}
              slug={listing.ownerSlug}
              kind={listing.ownerKind}
              isDemo={listing.isDemo}
            />
          </div>

          <div className="space-y-1 border-b border-border bg-card px-3 py-3 lg:rounded-xl lg:border lg:border-border">
            <div className="flex flex-wrap gap-1.5 lg:hidden">
              <Badge variant="secondary">{listing.type}</Badge>
              <Badge variant="outline">{dealLabels[listing.deal]}</Badge>
            </div>
            <h1 className="text-base font-bold text-primary md:text-lg lg:text-xl">
              {listing.title}
            </h1>
            <p className="text-xs text-primary">
              العقارات › {listing.type} › {dealLabels[listing.deal]} ›{" "}
              {areaLabel}
            </p>
            <p className="text-sm font-bold text-[color:var(--brand-gold)] lg:hidden">
              {listing.price}
            </p>
            <div className="hidden pt-1 lg:block">
              <ListingShareButton
                title={listing.title}
                text={`${listing.title} · ${listing.price} — أغاراتي`}
                url={`/properties/${listing.id}`}
              />
            </div>
          </div>

          <div className="lg:mt-4 lg:overflow-hidden lg:rounded-xl lg:border lg:border-border">
            <PropertyDetailTabs
              attributes={attributes}
              description={listing.description}
              areaLabel={areaLabel}
              mapPoint={mapPoint}
            />
          </div>

          <Card
            size="sm"
            className="mt-3 rounded-none border-x-0 shadow-none md:mx-4 md:rounded-xl md:border lg:hidden"
          >
            <CardHeader className="border-b">
              <CardTitle>المعلن والتواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <ListingAdvertiserLink
                  name={listing.ownerName}
                  slug={listing.ownerSlug}
                  kind={listing.ownerKind}
                  isDemo={listing.isDemo}
                />
              </div>
              <ListingContactBar {...contactProps} />
            </CardContent>
          </Card>

          {related.length > 0 ? (
            <section className="mt-4 space-y-2 px-3 md:px-4 lg:px-0">
              <h2 className="text-sm font-semibold lg:text-base">
                إعلانات مشابهة
              </h2>
              <ul className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border">
                {related.map((item) => (
                  <li key={item.id}>
                    <ListingResultRow
                      item={{
                        id: item.id,
                        href: `/properties/${item.id}`,
                        title: item.title,
                        price: item.price,
                        area: item.area,
                        type: item.type,
                        deal: item.deal,
                        image: item.image,
                        listingNumber: item.listingNumber,
                        rooms: item.rooms,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="sticky top-20 hidden space-y-3 self-start lg:block">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[0_8px_24px_rgba(15,39,68,0.05)]">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{listing.type}</Badge>
              <Badge variant="outline">{dealLabels[listing.deal]}</Badge>
            </div>
            <p className="text-xl font-bold text-[color:var(--brand-gold)]">
              {listing.price}
            </p>
            <p className="text-xs text-muted-foreground">{areaLabel}</p>
            <div className="border-t border-border pt-3">
              <ListingAdvertiserLink
                name={listing.ownerName}
                slug={listing.ownerSlug}
                kind={listing.ownerKind}
                isDemo={listing.isDemo}
              />
            </div>
            <ListingContactBar {...contactProps} />
          </div>
        </aside>
      </div>
    </div>
  )
}
