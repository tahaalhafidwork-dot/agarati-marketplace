import type { Metadata } from "next"
import Link from "next/link"

import {
  CategoryDirectory,
  getHomeCategoryRows,
  HomeAdBanner,
  HomeProjectsSection,
  HomeQuickLinks,
  HomeSearchBar,
  HomeTrustedAgenciesSection,
} from "@/components/home"
import { PropertyCardPlaceholder } from "@/components/property"
import {
  fetchApprovedAgencies,
  listProjects,
} from "@/lib/agency-directory"
import { fetchPublicListings } from "@/lib/listing-service"

export const metadata: Metadata = {
  title: "أغاراتي",
}

/** Cache homepage briefly — avoids force-dynamic cold DB work on every hit. */
export const revalidate = 60

export default async function HomePage() {
  const [listings, categoryRows, projects, agencies] = await Promise.all([
    fetchPublicListings({ sort: "newest" }, { take: 6 }),
    getHomeCategoryRows(),
    listProjects(undefined, 8),
    fetchApprovedAgencies({}, 6),
  ])
  const showcase = listings

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="border-b border-border bg-card px-3 py-2.5 md:px-4">
        <HomeSearchBar />
      </div>

      <div className="px-0 py-0 md:px-4 md:py-4">
        <CategoryDirectory
          rows={categoryRows}
          className="rounded-none border-0 ring-0 md:rounded-lg md:border md:ring-1 md:ring-foreground/5"
        />
      </div>

      <section className="space-y-2 border-t border-border bg-background px-3 py-4 md:px-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-sm font-semibold lg:text-base">أحدث الإعلانات</h1>
          <Link
            href="/categories"
            className="text-xs font-medium text-primary hover:underline"
          >
            تصفح التصنيفات
          </Link>
        </div>
        {showcase.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا إعلانات منشورة بعد. كن أول من{" "}
            <Link
              href="/dashboard/properties/new"
              className="text-primary hover:underline"
            >
              يضيف إعلاناً مجاناً
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {showcase.map((item) => (
              <PropertyCardPlaceholder
                key={item.id}
                href={`/properties/${item.id}`}
                listingId={item.id}
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
      </section>

      <HomeAdBanner />
      <HomeProjectsSection
        projects={projects.map((p) => ({
          slug: p.slug,
          name: p.name,
          citySlug: p.citySlug,
          imageUrl: p.imageUrl,
          summary: p.summary,
        }))}
      />
      <HomeTrustedAgenciesSection
        agencies={agencies.map((a) => ({
          slug: a.slug,
          officeName: a.officeName,
          logoUrl: a.logoUrl,
          locationLabel: a.locationLabel,
        }))}
      />
      <HomeQuickLinks />
    </div>
  )
}
