"use client"

import { useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { ChevronLeft, Heart, MapPin } from "lucide-react"

import { ListingFavoriteButton } from "@/components/property/listing-favorite-button"
import { ListingImage } from "@/components/property/listing-image"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  getLocalFavoriteIds,
  subscribeLocalFavorites,
} from "@/lib/favorites-local"
import type { PublicListingCard } from "@/lib/listings"
import {
  dealLabels,
  sampleListings,
  type SampleListing,
} from "@/lib/sample-listings"
import { formatListingNumber } from "@/lib/search"
import { enrichSampleCardOwner } from "@/lib/demo-advertisers"
import { cn } from "@/lib/utils"

function sampleToCard(item: SampleListing): PublicListingCard {
  return enrichSampleCardOwner(
    {
      ...item,
      id: item.slug,
      ownerPhone: "9647501234567",
      ownerWhatsapp: "9647501234567",
      listingNumber: formatListingNumber(item.listingNumber),
      contactMethod: "ALL",
      services: item.services ?? [],
    },
    item.slug
  )
}

function subscribeFavorites(onStoreChange: () => void) {
  return subscribeLocalFavorites(() => onStoreChange())
}

function getFavoritesKey() {
  return getLocalFavoriteIds().join("\0")
}

type Props = {
  serverCards: PublicListingCard[]
  signedIn: boolean
}

export function FavoritesListingsSection({ serverCards, signedIn }: Props) {
  const localIdsKey = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesKey,
    () => ""
  )
  const localIds = useMemo(
    () => (localIdsKey ? localIdsKey.split("\0") : []),
    [localIdsKey]
  )

  const serverIds = useMemo(
    () => new Set(serverCards.map((c) => c.id)),
    [serverCards]
  )

  const localCards = useMemo(() => {
    return localIds
      .filter((id) => !serverIds.has(id))
      .map((id) => {
        const sample = sampleListings.find((s) => s.slug === id)
        return sample ? sampleToCard(sample) : null
      })
      .filter((c): c is PublicListingCard => Boolean(c))
  }, [localIds, serverIds])

  const cards = [...serverCards, ...localCards]

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-14 text-center">
        <Heart className="mx-auto mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-foreground">لا إعلانات محفوظة بعد</p>
        <p className="mt-1 text-sm text-muted-foreground">
          من أي إعلان اضغط أيقونة القلب لحفظه هنا.
          {!signedIn
            ? " الإعلانات التجريبية تُحفظ على هذا الجهاز؛ المنشورة تحتاج تسجيل الدخول."
            : ""}
        </p>
        <Link
          href="/properties"
          className={cn(buttonVariants({ size: "sm" }), "mt-5 inline-flex")}
        >
          ابدأ التصفح
        </Link>
      </div>
    )
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {cards.map((item) => (
        <li
          key={item.id}
          className="relative border-b border-border last:border-b-0"
        >
          <Link
            href={`/properties/${item.id}`}
            className="flex gap-3 p-3 pe-14 transition-colors hover:bg-muted/50 sm:gap-4 sm:p-4 sm:pe-16"
          >
            <div className="relative size-[88px] shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
              <ListingImage
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="rounded-md text-[0.65rem]">
                  {dealLabels[item.deal]}
                </Badge>
                <Badge variant="outline" className="rounded-md text-[0.65rem]">
                  {item.type}
                </Badge>
                {item.isDemo ? (
                  <Badge variant="outline" className="rounded-md text-[0.65rem]">
                    تجريبي
                  </Badge>
                ) : null}
              </div>
              <h2 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
                {item.title}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{item.area}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                <p className="text-sm font-bold text-brand-gold sm:text-base">
                  {item.price}
                </p>
                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                  عرض الإعلان
                  <ChevronLeft className="size-3.5" />
                </span>
              </div>
            </div>
          </Link>
          <div className="absolute end-3 top-3 z-10 sm:end-4 sm:top-4">
            <ListingFavoriteButton
              listingId={item.id}
              favorited={!item.isDemo}
              isDemo={Boolean(item.isDemo)}
              signedIn
              size="icon"
              className="size-9 bg-background shadow-sm"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
