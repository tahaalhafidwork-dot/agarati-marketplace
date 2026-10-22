import type { CategoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

/**
 * Prestige category mark — solid ink plate, gold glyph, architectural weight.
 * No decorative bezels; presence comes from scale, contrast, and shadow.
 */
export function CategoryIconFrame({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: CategoryIcon
  size?: "sm" | "md"
  className?: string
}) {
  const box = size === "sm" ? "size-10" : "size-[3.25rem]"
  const glyph = size === "sm" ? "size-[1.15rem]" : "size-[1.35rem]"

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        box,
        className
      )}
      aria-hidden
    >
      {/* Soft depth under the plate */}
      <span
        className="absolute -inset-x-0.5 bottom-0 top-1 rounded-md bg-[#0F2744]/20 blur-[3px]"
        aria-hidden
      />

      {/* Main plate */}
      <span
        className={cn(
          "relative flex size-full items-center justify-center overflow-hidden rounded-md",
          "bg-[#0F2744]",
          "shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_8px_18px_-8px_rgba(15,39,68,0.55)]",
          "ring-1 ring-[color:var(--brand-gold)]/55",
          "transition-[transform,box-shadow] duration-200 ease-out",
          "group-hover:-translate-y-px",
          "group-hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_12px_22px_-8px_rgba(15,39,68,0.6)]",
          "group-hover:ring-[color:var(--brand-gold)]/80"
        )}
      >
        {/* Quiet top sheen */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent"
          aria-hidden
        />

        {/* Gold footing rule */}
        <span
          className="pointer-events-none absolute inset-x-2.5 bottom-1.5 h-px bg-[color:var(--brand-gold)]/50"
          aria-hidden
        />

        {/* Architectural corner ticks */}
        <span
          className="pointer-events-none absolute start-1.5 top-1.5 size-1.5 border-s border-t border-[color:var(--brand-gold)]/45"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute end-1.5 top-1.5 size-1.5 border-e border-t border-[color:var(--brand-gold)]/45"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute bottom-1.5 start-1.5 size-1.5 border-b border-s border-[color:var(--brand-gold)]/35"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute bottom-1.5 end-1.5 size-1.5 border-b border-e border-[color:var(--brand-gold)]/35"
          aria-hidden
        />

        <Icon
          className={cn(glyph, "relative z-[1] text-[color:var(--brand-gold)]")}
          strokeWidth={1.55}
        />
      </span>
    </span>
  )
}
