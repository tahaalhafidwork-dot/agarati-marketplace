import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Building2, ExternalLink, MapPin, Phone } from "lucide-react"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { PropertyCardPlaceholder } from "@/components/property"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { fetchAgencyBySlug } from "@/lib/agency-directory"
import { userAdvertiserSlug } from "@/lib/demo-advertisers"
import { fetchListingsByAdvertiser } from "@/lib/listing-service"
import { cn } from "@/lib/utils"


function joinLocation(label: string, addressLine: string | null) {
  const address = addressLine?.trim()
  const place = label.trim()
  if (!address) return place
  if (!place || place === "موقع غير محدد") return address
  if (place === address || place.includes(address) || address.includes(place)) {
    return address.length > place.length ? address : place
  }
  return `${place} · ${address}`
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const agency = await fetchAgencyBySlug(slug)
  return {
    title: agency ? `${agency.officeName} · وكالة عقارية` : "وكالة عقارية",
  }
}

export default async function AgencyProfilePage({ params }: Props) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw)
  const agency = await fetchAgencyBySlug(slug)
  if (!agency) notFound()

  const { listings } = await fetchListingsByAdvertiser(
    userAdvertiserSlug(agency.id)
  )

  const tel = agency.whatsapp || agency.phone

  return (
    <div className="mx-auto w-full max-w-7xl pb-8">
      <AppSubHeader title="وكالة عقارية" backHref="/agencies" />

      <div className="border-b border-border bg-card px-3 py-5 md:px-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
            {agency.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agency.logoUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Building2 className="size-8 text-[color:var(--brand-gold)]" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-[#0F2744]">
                {agency.officeName}
              </h1>
              <Badge variant="secondary">وكالة عقارية</Badge>
            </div>
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              <span>{joinLocation(agency.locationLabel, agency.addressLine)}</span>
            </p>
            {agency.bio ? (
              <p className="text-sm leading-6 text-[#0F2744]/90">{agency.bio}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              {tel ? (
                <a
                  href={`tel:${tel}`}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "gap-1.5"
                  )}
                >
                  <Phone className="size-3.5" />
                  اتصال
                </a>
              ) : null}
              {agency.socialUrl ? (
                <a
                  href={agency.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "secondary" }),
                    "gap-1.5"
                  )}
                >
                  <ExternalLink className="size-3.5" />
                  تواصل اجتماعي
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {agency.projectNames.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              المشاريع السكنية
            </p>
            <div className="flex flex-wrap gap-1.5">
              {agency.projectNames.map((name) => (
                <Badge
                  key={name}
                  variant="outline"
                  className="rounded-md text-[0.7rem]"
                >
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="px-3 py-4 md:px-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#0F2744]">
            إعلانات الوكالة ({listings.length})
          </h2>
          <Link
            href={`/advertisers/${encodeURIComponent(userAdvertiserSlug(agency.id))}`}
            className="text-xs text-primary hover:underline"
          >
            عرض كصفحة معلن
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            لا إعلانات منشورة حالياً لهذه الوكالة.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
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
                image={item.image}
                deal={item.deal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
