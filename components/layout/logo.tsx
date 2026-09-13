import Link from "next/link"

import { SITE_NAME_AR, SITE_NAME_LATIN } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-base font-semibold tracking-tight",
        className
      )}
    >
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
        أ
      </span>
      <span className="flex flex-col leading-none">
        <span>{SITE_NAME_AR}</span>
        <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground">
          {SITE_NAME_LATIN}
        </span>
      </span>
    </Link>
  )
}
