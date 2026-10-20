import Link from "next/link"

import { SITE_NAME_AR, SITE_NAME_LATIN } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  markClassName,
  mutedClassName,
}: {
  className?: string
  markClassName?: string
  mutedClassName?: string
}) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground",
          markClassName
        )}
      >
        أ
      </span>
      <span className="flex flex-col leading-none">
        <span>{SITE_NAME_AR}</span>
        <span
          className={cn(
            "text-[0.6rem] font-medium tracking-wide text-muted-foreground",
            mutedClassName
          )}
        >
          {SITE_NAME_LATIN}
        </span>
      </span>
    </Link>
  )
}
