import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  advertiserHref,
  advertiserKindLabel,
  type AdvertiserKind,
} from "@/lib/demo-advertisers"
import { cn } from "@/lib/utils"

type Props = {
  name?: string | null
  slug?: string | null
  kind?: AdvertiserKind | null
  isDemo?: boolean
  /** Compact for contact strip */
  compact?: boolean
  className?: string
  /** Show avatar (default true except compact text-only) */
  showAvatar?: boolean
}

export function ListingAdvertiserLink({
  name,
  slug,
  kind,
  isDemo,
  compact,
  className,
  showAvatar = true,
}: Props) {
  const display = name?.trim() || "معلن"
  const initial = display.slice(0, 1)
  const href = slug ? advertiserHref(slug) : null
  const kindLabel = kind ? advertiserKindLabel(kind) : null

  const inner = (
    <>
      {showAvatar ? (
        <Avatar
          className={cn(
            "shrink-0 ring-1 ring-[color:var(--brand-gold)]/35",
            compact ? "size-6" : "size-8"
          )}
        >
          <AvatarFallback
            className={cn(
              "bg-[#0F2744] font-semibold text-[color:var(--brand-gold)]",
              compact ? "text-[0.6rem]" : "text-[0.7rem]"
            )}
          >
            {initial}
          </AvatarFallback>
        </Avatar>
      ) : null}
      <span className="min-w-0 text-start">
        <span
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            compact ? "justify-center" : ""
          )}
        >
          <span
            className={cn(
              "truncate font-semibold text-[#0F2744]",
              compact ? "text-[0.72rem] tracking-wide" : "text-sm"
            )}
          >
            {display}
          </span>
          {isDemo ? (
            <Badge
              variant="outline"
              className="h-5 border-[color:var(--brand-gold)]/40 px-1.5 text-[0.55rem] font-medium text-[color:var(--brand-gold)]"
            >
              تجريبي
            </Badge>
          ) : null}
        </span>
        {!compact && kindLabel ? (
          <span className="mt-0.5 block text-[0.6rem] text-muted-foreground">
            {kindLabel}
          </span>
        ) : null}
      </span>
    </>
  )

  if (!href) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>{inner}</div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[color:var(--brand-gold)]/40",
        compact && "justify-center",
        className
      )}
      aria-label={`عرض إعلانات ${display}`}
    >
      {inner}
    </Link>
  )
}
