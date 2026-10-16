import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { PropertyCardPlaceholder } from "@/components/property"
import { ListingAdvertiserLink } from "@/components/property/listing-advertiser-link"
import { Badge } from "@/components/ui/badge"
import {
  advertiserKindLabel,
  getDemoAdvertiser,
  parseUserAdvertiserSlug,
} from "@/lib/demo-advertisers"
import { fetchListingsByAdvertiser } from "@/lib/listing-service"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const demo = getDemoAdvertiser(decoded)
  if (demo) {
    return { title: `${demo.name} · إعلانات المعلن` }
  }
  return { title: "إعلانات المعلن" }
}

export default async function AdvertiserPage({ params }: Props) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw)
  const { advertiser, listings } = await fetchListingsByAdvertiser(slug)

  if (!advertiser && listings.length === 0) {
    notFound()
  }

  const name = advertiser?.name ?? listings[0]?.ownerName ?? "معلن"
  const kind = advertiser?.kind ?? listings[0]?.ownerKind ?? "person"
  const isDemo = advertiser?.isDemo ?? listings[0]?.isDemo ?? false
  const isUser = Boolean(parseUserAdvertiserSlug(slug))

  return (
    <div className="mx-auto w-full max-w-7xl pb-8">
      <AppSubHeader
        title={kind === "agency" ? "وكالة عقارية" : "صفحة المعلن"}
        backHref="/properties"
      />

      <div className="border-b border-border bg-card px-3 py-4 md:px-4">
        <div className="flex flex-wrap items-start gap-3">
          <ListingAdvertiserLink
            name={name}
            slug={slug}
            kind={kind}
            isDemo={isDemo}
            showAvatar
            className="pointer-events-none"
          />
          <div className="ms-auto flex flex-wrap gap-1.5">
            <Badge variant="secondary">{advertiserKindLabel(kind)}</Badge>
            {isDemo ? (
              <Badge
                variant="outline"
                className="border-[color:var(--brand-gold)]/40 text-[color:var(--brand-gold)]"
              >
                حساب تجريبي
              </Badge>
            ) : null}
            {isUser && !isDemo ? (
              <Badge variant="outline">معلن مسجّل</Badge>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {listings.length} إعلان منشور
          {kind === "agency"
            ? " من هذه الوكالة"
            : " من هذا المعلن"}
          .
        </p>
      </div>

      {listings.length === 0 ? (
        <p className="px-3 py-12 text-center text-sm text-muted-foreground">
          لا توجد إعلانات نشطة لهذا المعلن حالياً.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 md:grid-cols-3 md:px-4">
          {listings.map((item) => (
            <PropertyCardPlaceholder
              key={item.id}
              href={`/properties/${item.id}`}
              listingId={item.id}
              favorited={false}
              isDemo={item.isDemo}
              title={item.title}
              area={item.area}
              price={item.price}
              meta={item.meta}
              date={item.date}
              deal={item.deal}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  )
}
