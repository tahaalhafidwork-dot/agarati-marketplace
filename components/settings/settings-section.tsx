import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SettingsSection({
  id,
  title,
  description,
  children,
  className,
  tone = "default",
}: {
  id?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  tone?: "default" | "danger"
}) {
  return (
    <section
      id={id}
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        tone === "danger"
          ? "border-destructive/25"
          : "border-border",
        className
      )}
    >
      <header
        className={cn(
          "border-b px-4 py-3.5 md:px-5",
          tone === "danger"
            ? "border-destructive/15 bg-destructive/[0.03]"
            : "border-border/80 bg-[#faf6ef]/55"
        )}
      >
        <h2
          className={cn(
            "text-sm font-semibold tracking-tight",
            tone === "danger" ? "text-destructive" : "text-[#0F2744]"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      <div className="space-y-4 px-4 py-4 md:px-5">{children}</div>
    </section>
  )
}
