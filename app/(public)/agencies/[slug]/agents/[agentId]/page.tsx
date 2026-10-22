import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Building2, UserRound } from "lucide-react"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { PropertyCardPlaceholder } from "@/components/property"
import { Badge } from "@/components/ui/badge"
import { fetchAgencyBySlug } from "@/lib/agency-directory"
import { prisma } from "@/lib/db"
import { fetchListingsByAgency } from "@/lib/listing-service"

export const metadata: Metadata = { title: "وكيل عقاري" }

export default async function AgencyAgentPage({
  params,
}: {
  params: Promise<{ slug: string; agentId: string }>
}) {
  const { slug, agentId } = await params
  const agency = await fetchAgencyBySlug(slug)
  if (!agency) notFound()

  const member = await prisma.agencyMembership.findFirst({
    where: { agencyId: agency.id, userId: agentId, status: "ACTIVE" },
    select: {
      role: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  })
  if (!member) notFound()
  const listings = await fetchListingsByAgency(agency.id, member.user.id)

  return (
    <div className="mx-auto w-full max-w-7xl pb-10">
      <AppSubHeader
        title="الوكيل العقاري"
        backHref={`/agencies/${encodeURIComponent(agency.slug)}`}
      />
      <section className="border-b border-border bg-card px-4 py-6">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-[#0F2744]/8 text-xl font-semibold text-[#0F2744]">
            {member.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              member.user.name.slice(0, 1)
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#0F2744]">
              {member.user.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="size-3.5" /> {agency.officeName}
            </p>
            <Badge variant="outline" className="mt-2">
              {member.role === "OWNER" ? "صاحب الوكالة" : "وكيل عقاري"}
            </Badge>
          </div>
        </div>
      </section>
      <section className="px-3 py-5 md:px-4">
        <div className="mb-3 flex items-center gap-2">
          <UserRound className="size-4 text-[color:var(--brand-gold)]" />
          <h2 className="font-semibold text-[#0F2744]">
            عقارات الوكيل ({listings.length})
          </h2>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            لا توجد عقارات منشورة لهذا الوكيل حاليًا.
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
      </section>
    </div>
  )
}
