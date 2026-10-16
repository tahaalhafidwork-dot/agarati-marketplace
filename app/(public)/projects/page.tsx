import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Landmark } from "lucide-react"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { ProjectsSearchBar } from "@/components/projects/projects-search-bar"
import { listProjects } from "@/lib/agency-directory"
import { formatShortArea, getCity, iraqCities } from "@/lib/locations"
import { projectHeroCover } from "@/lib/project-images"
import { projectKindLabelAr } from "@/lib/project-kinds"

export const metadata: Metadata = {
  title: "المشاريع السكنية",
}

type Props = {
  searchParams: Promise<{ q?: string; city?: string }>
}

export default async function ProjectsIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = sp.q?.trim() || ""
  const city = sp.city?.trim() || ""
  const projects = await listProjects(
    { q: q || undefined, city: city || undefined },
    80
  )

  const cityLabel = city ? getCity(city)?.label : null
  const filterParts = [
    cityLabel ? `مدينة: ${cityLabel}` : null,
    q ? `اسم: «${q}»` : null,
  ].filter(Boolean)

  return (
    <div className="mx-auto w-full max-w-7xl pb-10">
      <AppSubHeader title="المشاريع السكنية" backHref="/" />

      <div className="space-y-3 px-3 py-4 md:px-4">
        <ProjectsSearchBar
          initialQ={q}
          initialCity={city}
          cities={iraqCities.map((c) => ({ slug: c.slug, label: c.label }))}
        />

        <p className="text-xs text-muted-foreground">
          {filterParts.length > 0
            ? `${projects.length} نتيجة · ${filterParts.join(" · ")}`
            : `${projects.length} مشروعاً معتمداً`}
        </p>

        {projects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">
            {filterParts.length > 0
              ? "لا نتائج لهذا البحث. غيّر المدينة أو اسم المشروع."
              : "لا مشاريع معتمدة بعد. ستظهر هنا بعد موافقة الإدارة."}
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {projects.map((p) => {
              const area =
                p.citySlug != null
                  ? formatShortArea({
                      city: p.citySlug,
                      district: p.districtSlug || p.citySlug,
                      neighborhood:
                        p.neighborhoodSlug ||
                        p.districtSlug ||
                        p.citySlug,
                    })
                  : null

              const cover = projectHeroCover(p, p.slug)

              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${encodeURIComponent(p.slug)}`}
                    className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-[#f7f3ec]/80"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Landmark className="size-4 text-[color:var(--brand-gold)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-[#0F2744]">
                          {p.name}
                        </p>
                        {p.projectKind === "MIXED_USE" ? (
                          <span className="shrink-0 rounded bg-[#f7f3ec] px-1 py-px text-[0.55rem] font-medium text-[#0F2744]/80">
                            {projectKindLabelAr(p.projectKind)}
                          </span>
                        ) : null}
                      </div>
                      {area ? (
                        <p className="truncate text-[0.7rem] text-muted-foreground">
                          {area}
                        </p>
                      ) : null}
                      {p.summary ? (
                        <p className="line-clamp-1 text-[0.7rem] text-muted-foreground">
                          {p.summary}
                        </p>
                      ) : null}
                    </div>
                    <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
