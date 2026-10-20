import Link from "next/link"

import { ListingImage } from "@/components/property/listing-image"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type PropertyCardPlaceholderProps = {
  title: string
  area: string
  price?: string
  meta?: string
  date?: string
  deal?: "sale" | "rent" | "daily"
  image?: string
  href?: string
  listingId?: string
  favorited?: boolean
  isDemo?: boolean
  variant?: "grid" | "list"
  className?: string
}

export function PropertyCardPlaceholder({
  title,
  area,
  price = "—",
  meta = "—",
  date,
  deal = "sale",
  image,
  href,
  isDemo = false,
  variant = "grid",
  className,
}: PropertyCardPlaceholderProps) {
  const dealLabel =
    deal === "rent"
      ? "للإيجار"
      : deal === "daily"
        ? "إيجار يومي"
        : "للبيع"

  const thumb = (frameClass: string) => (
    <div className={cn("relative overflow-hidden bg-muted", frameClass)}>
      {image ? (
        <ListingImage
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes={
            variant === "list"
              ? "(max-width: 640px) 112px, 208px"
              : "(max-width: 640px) 50vw, 25vw"
          }
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          صورة العقار
        </span>
      )}
      <Badge className="absolute start-2 top-2" variant="secondary">
        {dealLabel}
      </Badge>
      {isDemo ? (
        <Badge className="absolute end-2 top-2" variant="outline">
          تجريبي
        </Badge>
      ) : null}
    </div>
  )

  const body =
    variant === "list" ? (
      <Card
        size="sm"
        className={cn(
          "group py-0 transition-shadow hover:ring-primary/30",
          className
        )}
      >
        <div className="flex gap-0">
          {thumb("aspect-[4/3] w-28 shrink-0 sm:w-44 md:w-52")}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle className="text-base font-bold text-[color:var(--brand-gold)] sm:text-lg">
                  {price}
                </CardTitle>
                {date ? (
                  <span className="text-[0.7rem] text-muted-foreground">
                    {date}
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-2 text-sm font-medium leading-5 group-hover:text-primary">
                {title}
              </p>
              <CardDescription>{area}</CardDescription>
            </div>
            <p className="text-xs text-muted-foreground">{meta}</p>
          </div>
        </div>
      </Card>
    ) : (
      <Card
        size="sm"
        className={cn(
          "group gap-0 py-0 transition-shadow hover:ring-primary/30",
          className
        )}
      >
        {thumb("aspect-[4/3]")}
        <CardHeader className="gap-1 border-0">
          <CardTitle className="text-base font-bold text-[color:var(--brand-gold)]">
            {price}
          </CardTitle>
          <p className="line-clamp-2 text-sm font-medium leading-5 group-hover:text-primary">
            {title}
          </p>
          <CardDescription>{area}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-between gap-2 border-0 bg-transparent py-0 pb-3">
          <span className="text-xs text-muted-foreground">{meta}</span>
          {date ? (
            <span className="text-[0.65rem] text-muted-foreground">{date}</span>
          ) : null}
        </CardFooter>
      </Card>
    )

  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    )
  }

  return body
}
