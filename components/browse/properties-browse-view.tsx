import Link from "next/link"
import { List as ListIcon, MapPin, RotateCcw } from "lucide-react"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { HomeSearchBar } from "@/components/home"
import { BrowseListingsMapLazy } from "@/components/map/browse-listings-map-lazy"
import { ListingResultRow } from "@/components/property/listing-result-row"
import {
  ListingsFilterRail,
  ListingsToolbar,
  SaveSearchButton,
} from "@/components/search"
import { Button } from "@/components/ui/button"
import type { BrowsePageModel } from "@/application/listings/browse-page"
import { buildPropertiesHref } from "@/lib/listing-query"
import { categorySlugs } from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

/** Presentational browse shell — logic lives in loadPropertiesBrowsePage. */
export function PropertiesBrowseView({ model }: { model: BrowsePageModel }) {
  const {
    query,
    mapView,
    listings,
    mapListings,
    title,
    countLabel,
    backHref,
    typeLabel,
    dealLabel,
    activeCount,
    clearHref,
    listHref,
    mapHref,
    saveHref,
    initialSaved,
    showMapFab,
    emptyMessage,
    sortLabelText,
    pageSize,
    catalogProjects,
  } = model

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AppSubHeader
        title={title}
        subtitle={`${countLabel} إعلان`}
        backHref={backHref}
        actions={
          <SaveSearchButton
            href={saveHref}
            title={title}
            initialSaved={initialSaved}
          />
        }
      />

      <div className="border-b border-border bg-card px-3 py-2.5 md:px-4">
        <HomeSearchBar
          key={query.q ?? ""}
          initialQuery={query.q ?? ""}
          baseQuery={{ ...query, view: mapView ? "map" : "list" }}
        />
      </div>

      <div className="hidden border-b border-border bg-card px-4 py-3 md:flex md:items-center md:justify-between md:gap-3">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-xs text-muted-foreground">
            {countLabel} إعلان · مرتّب حسب {sortLabelText} · يعرض حتى {pageSize} إعلاناً
          </p>
        </div>
        <SaveSearchButton
          href={saveHref}
          title={title}
          initialSaved={initialSaved}
          chrome="default"
        />
      </div>

      <nav
        className="overflow-x-auto whitespace-nowrap bg-[#eee8df] px-3 py-2 text-[0.7rem] text-primary md:bg-muted/40"
        aria-label="مسار التنقل"
      >
        <Link href="/" className="hover:underline">
          الرئيسية
        </Link>
        <span className="mx-1 opacity-60" aria-hidden="true">
          ›
        </span>
        <Link href="/categories" className="hover:underline">
          العقارات
        </Link>
        {query.category ? (
          <>
            <span className="mx-1 opacity-60" aria-hidden="true">
              ›
            </span>
            <Link
              href={`/categories/${categorySlugs[query.category]}`}
              className="hover:underline"
            >
              {typeLabel}
            </Link>
          </>
        ) : null}
        {dealLabel ? (
          <>
            <span className="mx-1 opacity-60" aria-hidden="true">
              ›
            </span>
            <span className="font-medium text-foreground">{dealLabel}</span>
          </>
        ) : (
          <>
            <span className="mx-1 opacity-60" aria-hidden="true">
              ›
            </span>
            <span
              className="font-medium text-foreground"
              aria-current="page"
            >
              {title}
            </span>
          </>
        )}
      </nav>

      <ListingsToolbar
        query={query}
        view={mapView ? "map" : "list"}
        catalogProjects={catalogProjects}
      />

      <div className="lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="hidden border-e border-border p-4 lg:block">
          <ListingsFilterRail
            key={JSON.stringify({ ...query, mapView })}
            query={query}
            view={mapView ? "map" : "list"}
            catalogProjects={catalogProjects}
          />
        </aside>

        <div className="relative bg-[#f3ebe0]/50 md:bg-background">
          {listings.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              {(activeCount > 0 || query.q) && (
                <Link
                  href={
                    query.q
                      ? buildPropertiesHref({
                          ...query,
                          q: undefined,
                          view: mapView ? "map" : "list",
                        })
                      : clearHref
                  }
                  className="mt-4 inline-flex"
                >
                  <Button variant="outline" className="gap-1.5">
                    <RotateCcw className="size-3.5" />
                    {query.q ? "مسح البحث" : "مسح الفلاتر"}
                  </Button>
                </Link>
              )}
            </div>
          ) : mapView ? (
            <BrowseListingsMapLazy
              listings={mapListings}
              listHref={listHref}
            />
          ) : (
            <ul className="divide-y divide-border/80">
              {listings.map((item) => (
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
          )}

          {showMapFab ? (
            <Link
              href={mapView ? listHref : mapHref}
              className={cn(
                "fixed end-4 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_rgba(15,39,68,0.35)]",
                "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:absolute md:bottom-5 md:end-5",
                "transition hover:brightness-110 active:scale-[0.98]"
              )}
              aria-label={mapView ? "العودة للقائمة" : "عرض على الخريطة"}
            >
              {mapView ? (
                <>
                  <ListIcon className="size-4" />
                  القائمة
                </>
              ) : (
                <>
                  <MapPin className="size-4" />
                  الخريطة
                  <span className="rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[0.65rem] tabular-nums">
                    {mapListings.length}
                  </span>
                </>
              )}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
