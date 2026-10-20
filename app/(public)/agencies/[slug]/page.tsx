import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Building2, ExternalLink, MapPin, Phone, Users } from "lucide-react"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { PropertyCardPlaceholder } from "@/components/property"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { fetchAgencyBySlug } from "@/lib/agency-directory"
import { fetchListingsByAgency } from "@/lib/listing-service"
import { prisma } from "@/lib/db"
import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/phone"


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

  const [listings, agents] = await Promise.all([
    fetchListingsByAgency(agency.id),
    prisma.agencyMembership.findMany({
      where: { agencyId: agency.id, status: "ACTIVE" },
      select: {
        role: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    }),
  ])

  const tel = agency.phone

  return (
    <div className="mx-auto w-full max-w-7xl pb-8">
      <AppSubHeader title="وكالة عقارية" backHref="/agencies" />

      {agency.coverUrl ? (
        <div className="h-36 overflow-hidden bg-muted md:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={agency.coverUrl} alt="" className="size-full object-cover" />
        </div>
      ) : null}
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
              {agency.whatsapp ? (
                <a
                  href={whatsappUrl(agency.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "gap-1.5"
                  )}
                >
                  <Phone className="size-3.5" /> واتساب
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
              {[
                [agency.websiteUrl, "الموقع الإلكتروني"],
                [agency.instagramUrl, "إنستغرام"],
                [agency.facebookUrl, "فيسبوك"],
              ]
                .filter(
                  (entry): entry is [string, string] =>
                    Boolean(entry[0]) && entry[0] !== agency.socialUrl
                )
                .map(([url, label]) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ size: "sm", variant: "secondary" }),
                      "gap-1.5"
                    )}
                  >
                    <ExternalLink className="size-3.5" /> {label}
                  </a>
                ))}
              {agency.mapLat != null && agency.mapLng != null ? (
                <a
                  href={`https://www.google.com/maps?q=${agency.mapLat},${agency.mapLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "gap-1.5"
                  )}
                >
                  <MapPin className="size-3.5" /> الخريطة
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

      <section id="agents" className="border-b border-border px-3 py-5 md:px-4">
        <div className="mb-3 flex items-center gap-2">
          <Users className="size-4 text-[color:var(--brand-gold)]" />
          <h2 className="text-sm font-semibold text-[#0F2744]">
            فريق الوكالة ({agents.length})
          </h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((member) => (
            <Link
              key={member.user.id}
              href={`/agencies/${encodeURIComponent(agency.slug)}/agents/${member.user.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-[#B8956C]/60"
            >
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#0F2744]/8 font-semibold text-[#0F2744]">
                {member.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.user.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  member.user.name.slice(0, 1)
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F2744]">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {member.role === "OWNER" ? "صاحب الوكالة" : "وكيل عقاري"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="px-3 py-4 md:px-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#0F2744]">
            إعلانات الوكالة ({listings.length})
          </h2>
          <Link
            href="#agents"
            className="text-xs text-primary hover:underline"
          >
            عرض فريق الوكالة
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
