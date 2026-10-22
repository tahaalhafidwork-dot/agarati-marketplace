import Link from "next/link"
import {
  ChevronLeft,
  MapPin,
  MessageCircle,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  formatAreaRange,
  requestStatusLabels,
  type PropertyRequestCard,
} from "@/lib/property-requests"
import { cn } from "@/lib/utils"

type Props = {
  item: PropertyRequestCard
  highlight?: boolean
  showOwner?: boolean
}

export function PropertyRequestCardView({
  item,
  highlight,
  showOwner = true,
}: Props) {
  const areaRange = formatAreaRange(item.minAreaM2, item.maxAreaM2)

  return (
    <Link
      href={`/dashboard/property-requests/${item.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-[color:var(--brand-gold)]/45 hover:shadow-[0_16px_40px_-24px_rgba(15,39,68,0.45)]",
        highlight
          ? "border-[color:var(--brand-gold)]/40 bg-[linear-gradient(160deg,#fffdf9,#f6efe4)]"
          : "border-border"
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,149,108,0.55),transparent)]"
        aria-hidden
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.dealLabel ? (
            <Badge className="rounded-md bg-[#0F2744] text-[0.65rem] text-[#f8f1e6]">
              {item.dealLabel}
            </Badge>
          ) : null}
          {item.categoryLabel ? (
            <Badge variant="secondary" className="rounded-md text-[0.65rem]">
              {item.categoryLabel}
            </Badge>
          ) : null}
          <Badge
            variant="outline"
            className={cn(
              "rounded-md text-[0.65rem]",
              item.status === "OPEN" && "border-emerald-600/30 text-emerald-800"
            )}
          >
            {requestStatusLabels[item.status]}
          </Badge>
        </div>
        <span className="text-[0.65rem] text-muted-foreground">
          {item.createdAt.toLocaleDateString("ar-IQ-u-nu-latn")}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-[#0F2744] transition group-hover:text-[#0F2744]/90">
        {item.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6B6560]">
        {item.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5 text-[color:var(--brand-gold)]" />
          {item.areaLabel}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-[color:var(--brand-gold)]">
          <Wallet className="size-3.5" />
          {item.budgetLabel}
        </span>
        {item.rooms ? <span>غرف: {item.rooms}</span> : null}
        {areaRange ? <span>{areaRange}</span> : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
        {showOwner ? (
          <p className="truncate text-xs text-muted-foreground">
            طالب العقار:{" "}
            <span className="font-medium text-foreground">{item.ownerName}</span>
          </p>
        ) : (
          <span className="text-xs text-muted-foreground">طلبك</span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2744]">
          {item.messageCount > 0 ? (
            <>
              <MessageCircle className="size-3.5" />
              {item.messageCount}
            </>
          ) : (
            <>
              التفاصيل
              <ChevronLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
            </>
          )}
        </span>
      </div>
    </Link>
  )
}
