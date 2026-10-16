import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Quiet luxury back control — frosted disc, thin gold hairline, no label clutter. */
function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="رجوع"
      className={cn(
        "group relative flex size-9 shrink-0 items-center justify-center rounded-full",
        "border border-[color:var(--brand-gold)]/30 bg-white/[0.07]",
        "text-primary-foreground/90",
        "transition-[background-color,border-color,color,transform] duration-200 ease-out",
        "hover:border-[color:var(--brand-gold)]/55 hover:bg-white/[0.12] hover:text-[#e8d5b5]",
        "active:scale-[0.94]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-gold)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      )}
    >
      <ChevronRight
        className="size-[1.15rem] transition-transform duration-200 ease-out group-hover:translate-x-px"
        strokeWidth={1.6}
      />
    </Link>
  )
}

export function AppSubHeader({
  title,
  subtitle,
  backHref = "/",
  actions,
}: {
  title: string
  subtitle?: string
  backHref?: string
  actions?: ReactNode
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 relative bg-[#0F2744] text-[#f8f1e6] md:hidden",
        "shadow-[0_8px_24px_-12px_rgba(15,39,68,0.45)]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,149,108,0.55)_20%,rgba(184,149,108,0.55)_80%,transparent)]"
        aria-hidden
      />
      <div className="relative flex h-12 items-center gap-2 px-2">
        <BackButton href={backHref} />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold tracking-wide text-[#f8f1e6]">
            {title}
          </p>
          {subtitle ? (
            <p className="truncate text-[0.65rem] text-[#f8f1e6]/55">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-9 shrink-0 items-center justify-end gap-0.5">
          {actions}
        </div>
      </div>
    </header>
  )
}

export function CategoryRowLink({
  label,
  count,
  href,
  emphasize,
  comingSoon,
  description,
}: {
  label: string
  count?: string
  href?: string
  emphasize?: boolean
  /** Non-navigable row — shows «قريباً» instead of chevron. */
  comingSoon?: boolean
  description?: string
}) {
  const isAllPhrase = Boolean(emphasize) || /^كل[\s\u00A0]/.test(label)
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm",
            comingSoon
              ? "font-medium text-muted-foreground"
              : isAllPhrase
                ? "font-bold tracking-wide text-[color:var(--brand-gold)]"
                : "font-medium text-foreground"
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-[0.7rem] leading-5 text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {comingSoon ? (
        <span className="shrink-0 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
          قريباً
        </span>
      ) : count ? (
        <span
          className={cn(
            "shrink-0 text-sm tabular-nums",
            isAllPhrase
              ? "font-semibold text-[color:var(--brand-gold)]/80"
              : "text-muted-foreground"
          )}
        >
          ({count})
        </span>
      ) : null}
      {!comingSoon ? (
        <ChevronLeft
          className={cn(
            "size-4 shrink-0",
            isAllPhrase
              ? "text-[color:var(--brand-gold)]"
              : "text-muted-foreground"
          )}
        />
      ) : null}
    </>
  )

  const rowClass = cn(
    "flex items-center gap-2 border-b border-border px-4 py-3.5 transition-colors",
    comingSoon
      ? "cursor-default bg-muted/20"
      : isAllPhrase
        ? "bg-[linear-gradient(90deg,rgba(184,149,108,0.14)_0%,rgba(184,149,108,0.04)_55%,transparent_100%)] active:bg-muted/50"
        : "bg-card active:bg-muted/50"
  )

  if (comingSoon || !href) {
    return (
      <div className={rowClass} aria-disabled>
        {body}
      </div>
    )
  }

  return (
    <Link href={href} className={rowClass}>
      {body}
    </Link>
  )
}
