import Link from "next/link"
import { Building2, ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"

/** Full-width reserved banner below latest listings. */
export function HomeAdBanner({ className }: { className?: string }) {
  return (
    <section
      className={cn("px-3 py-4 md:px-4", className)}
      aria-label="مساحة إعلانية"
    >
      <div
        className="flex min-h-[5.5rem] items-center justify-center rounded-2xl border border-dashed border-[color:var(--brand-gold)]/35 bg-gradient-to-l from-[#faf6ef]/80 via-card to-card px-4 py-6 shadow-[0_8px_28px_-18px_rgba(15,39,68,0.2)]"
        data-ad-slot="home-below-listings"
      >
        <p className="text-center text-xs tracking-wide text-muted-foreground">
          مساحة إعلانية · قريباً
        </p>
      </div>
    </section>
  )
}

type ProjectRow = {
  slug: string
  name: string
  citySlug: string | null
  imageUrl: string | null
  summary: string | null
}

export function HomeProjectsSection({
  projects,
}: {
  projects: ProjectRow[]
}) {
  return (
    <section className="space-y-3 border-t border-border px-3 py-5 md:px-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#0F2744]">
            المشاريع السكنية
          </h2>
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
            تعرّف على المشروع ثم اعثر على الوكالات المخوّلة
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          الكل
          <ChevronLeft className="size-3.5" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
          ستظهر المشاريع هنا بعد موافقة الإدارة.
        </p>
      ) : (
        <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((p) => (
            <li key={p.slug} className="shrink-0">
              <Link
                href={`/projects/${encodeURIComponent(p.slug)}`}
                className={cn(
                  "relative flex h-36 w-44 flex-col justify-end overflow-hidden rounded-xl border border-border",
                  "bg-[#0F2744] shadow-[0_10px_24px_-16px_rgba(15,39,68,0.45)]",
                  "transition hover:ring-1 hover:ring-[color:var(--brand-gold)]/50"
                )}
              >
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : null}
                <span
                  className="absolute inset-0 bg-gradient-to-t from-[#0F2744]/95 via-[#0F2744]/45 to-transparent"
                  aria-hidden
                />
                <span className="relative space-y-0.5 p-3">
                  <span className="block truncate text-sm font-semibold text-[#f8f1e6]">
                    {p.name}
                  </span>
                  <span className="block truncate text-[0.65rem] text-[#f8f1e6]/70">
                    {p.summary?.slice(0, 42) || "عرض التفاصيل"}
                    {p.summary && p.summary.length > 42 ? "…" : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

type AgencyRow = {
  slug: string
  officeName: string
  logoUrl: string | null
  locationLabel: string
}

export function HomeTrustedAgenciesSection({
  agencies,
}: {
  agencies: AgencyRow[]
}) {
  return (
    <section className="space-y-3 border-t border-border bg-[#faf6ef]/35 px-3 py-5 md:px-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#0F2744]">
            وكالات موثوقة
          </h2>
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
            مكاتب موافق عليها من إدارة أغاراتي
          </p>
        </div>
        <Link
          href="/agencies"
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          الدليل
          <ChevronLeft className="size-3.5" />
        </Link>
      </div>

      {agencies.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-3 py-6 text-center text-xs text-muted-foreground">
          ستظهر هنا الوكالات بعد موافقة الإدارة.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {agencies.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/agencies/${encodeURIComponent(a.slug)}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 transition hover:bg-[#f7f3ec]/80"
              >
                <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {a.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.logoUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Building2 className="size-4 text-[color:var(--brand-gold)]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#0F2744]">
                    {a.officeName}
                  </p>
                  <p className="truncate text-[0.7rem] text-muted-foreground">
                    {a.locationLabel}
                  </p>
                </div>
                <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const QUICK_LINKS = [
  { href: "/support", label: "الدعم" },
  { href: "/support/report", label: "الإبلاغ" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/services", label: "الخدمات" },
] as const

export function HomeQuickLinks() {
  return (
    <section className="border-t border-border px-3 py-5 md:px-4">
      <h2 className="sr-only">روابط سريعة</h2>
      <nav
        aria-label="روابط سريعة"
        className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2"
      >
        {QUICK_LINKS.map((link, i) => (
          <span key={link.href} className="inline-flex items-center gap-1">
            {i > 0 ? (
              <span className="mx-1 text-[color:var(--brand-gold)]/40" aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={link.href}
              className="text-xs font-medium text-muted-foreground transition hover:text-[#0F2744]"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </nav>
    </section>
  )
}
