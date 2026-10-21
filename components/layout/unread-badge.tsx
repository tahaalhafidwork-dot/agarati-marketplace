import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** Compact unread count chip for nav icons and labels. */
export function UnreadBadge({
  count,
  className,
  ...props
}: {
  count: number
} & ComponentProps<"span">) {
  if (!count || count < 1) return null
  const label = count > 99 ? "99+" : String(count)

  return (
    <span
      className={cn(
        "inline-flex min-w-[1.1rem] items-center justify-center rounded-full",
        "bg-destructive px-1 text-[0.58rem] font-bold leading-none text-white",
        "h-[1.1rem] tabular-nums shadow-sm",
        className
      )}
      aria-label={`${label} تنبيه جديد`}
      {...props}
    >
      {label}
    </span>
  )
}
