import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function LegalArticle({
  title,
  effectiveDate,
  children,
  className,
}: {
  title: string
  effectiveDate: string
  children: ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        "mx-auto max-w-3xl space-y-6 px-4 py-8 text-sm leading-7 text-foreground",
        className
      )}
    >
      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F2744]">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">
          تاريخ السريان: {effectiveDate}
        </p>
        <p className="text-xs leading-6 text-muted-foreground">
          هذا النص تشغيلي لحماية المنصة ومستخدميها، ولا يُعد استشارة قانونية
          خارجية. للاستفسارات استخدم صفحة الدعم.
        </p>
      </header>
      {children}
    </article>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-[#0F2744]">{title}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  )
}
