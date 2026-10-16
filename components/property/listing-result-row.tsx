import Link from "next/link"
import { MapPin } from "lucide-react"

import { ListingImage } from "@/components/property/listing-image"
import { Badge } from "@/components/ui/badge"
import { dealLabels, type DealType } from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

export type ListingResultRowData = {
  id: string
  href: string
  title: string
  price: string
  area: string
  type: string
  deal: DealType
  image: string
  listingNumber: string
  /** Existing listing meta. Omitted when the listing has no room count. */
  rooms?: string | null
}

type Props = {
  item: ListingResultRowData
  /** When set, row acts as a button (map preview) instead of a Link */
  onActivate?: () => void
  className?: string
  selected?: boolean
}

/** Shared list / map-preview strip — same visual as browse results. */
export function ListingResultRow({
  item,
  onActivate,
  className,
  selected,
}: Props) {
  const body = (
    <>
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-sm bg-muted sm:size-24 md:size-28 lg:size-32">
        <ListingImage
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 128px, (min-width: 768px) 112px, 96px"
        />
      </div>
      <div className="min-w-0 flex-1 md:flex md:min-h-[7rem] md:flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-bold leading-5 text-foreground md:text-[0.95rem] md:leading-6 lg:line-clamp-2">
            {item.title}
          </p>
          <span
            className="shrink-0 font-mono text-[0.65rem] tabular-nums text-muted-foreground"
            dir="ltr"
          >
            #{item.listingNumber}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <Badge variant="secondary" className="rounded-sm text-[0.65rem]">
            {dealLabels[item.deal]}
          </Badge>
          <Badge variant="outline" className="rounded-sm text-[0.65rem]">
            {item.type}
          </Badge>
          {item.rooms && item.rooms !== "—" ? (
            <Badge variant="outline" className="rounded-sm text-[0.65rem]">
              {item.rooms}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground md:mt-2">
          <MapPin className="size-3 shrink-0" />
          {item.area}
        </p>
        <p className="mt-1 text-end text-sm font-bold text-[color:var(--brand-gold)] md:mt-auto md:pt-2 md:text-base">
          {item.price}
        </p>
      </div>
    </>
  )

  const shell = cn(
    "flex w-full gap-3 bg-[#faf6ef] px-3 py-2.5 text-start transition-colors",
    "hover:bg-[#f3ebe0] md:gap-4 md:bg-card md:px-4 md:py-3 md:hover:bg-muted/40",
    selected && "ring-2 ring-inset ring-primary/25",
    className
  )

  if (onActivate) {
    return (
      <button type="button" onClick={onActivate} className={shell}>
        {body}
      </button>
    )
  }

  return (
    <Link href={item.href} className={shell}>
      {body}
    </Link>
  )
}
