"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Building2, MapPin, Search } from "lucide-react"

import {
  LocationFilterFields,
  type LocationFilterValue,
} from "@/components/search/location-filter-fields"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AgencyDirectoryCard } from "@/lib/agency-directory"

type ProjectOpt = { slug: string; name: string }

type Props = {
  initialMode: "region" | "project"
  initialCity?: string
  initialDistrict?: string
  initialNeighborhood?: string
  initialProject?: string
  projects: ProjectOpt[]
  agencies: AgencyDirectoryCard[]
}

export function AgenciesDirectoryClient({
  initialMode,
  initialCity,
  initialDistrict,
  initialNeighborhood,
  initialProject,
  projects,
  agencies,
}: Props) {
  const [mode, setMode] = useState<"region" | "project">(initialMode)
  const [location, setLocation] = useState<LocationFilterValue>({
    city: initialCity,
    district: initialDistrict,
    neighborhood: initialNeighborhood,
  })
  const [projectSlug, setProjectSlug] = useState(initialProject ?? "")
  const [projectQuery, setProjectQuery] = useState("")

  const filteredProjects = useMemo(() => {
    const q = projectQuery.trim()
    if (!q) return projects
    return projects.filter((p) => p.name.includes(q) || p.slug.includes(q))
  }, [projects, projectQuery])

  function buildHref(next: {
    mode?: "region" | "project"
    city?: string
    district?: string
    neighborhood?: string
    project?: string
  }) {
    const params = new URLSearchParams()
    const m = next.mode ?? mode
    params.set("mode", m)
    if (m === "region") {
      const city = next.city ?? location.city
      const district = next.district ?? location.district
      const neighborhood = next.neighborhood ?? location.neighborhood
      if (city) params.set("city", city)
      if (district) params.set("district", district)
      if (neighborhood) params.set("neighborhood", neighborhood)
    } else {
      const project = next.project ?? projectSlug
      if (project) params.set("project", project)
    }
    return `/agencies?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => setMode("region")}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-medium transition",
            mode === "region"
              ? "bg-card text-[#0F2744] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          حسب المنطقة
        </button>
        <button
          type="button"
          onClick={() => setMode("project")}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-medium transition",
            mode === "project"
              ? "bg-card text-[#0F2744] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          حسب المشروع
        </button>
      </div>

      {mode === "region" ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
          <LocationFilterFields
            value={location}
            onChange={(next) =>
              setLocation({
                city: next.city,
                district: next.district,
                neighborhood: next.neighborhood,
              })
            }
          />
          <Link
            href={buildHref({
              mode: "region",
              city: location.city,
              district: location.district,
              neighborhood: location.neighborhood,
            })}
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full gap-1.5 sm:w-auto"
            )}
          >
            <Search className="size-3.5" />
            عرض الوكالات
          </Link>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
          <label className="block space-y-1.5">
            <span className="text-[0.7rem] font-medium text-muted-foreground">
              ابحث عن مشروع
            </span>
            <input
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              placeholder="مثال: فلوريا ستي"
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
            {filteredProjects.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                لا مشاريع مطابقة
              </p>
            ) : (
              filteredProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={buildHref({ mode: "project", project: p.slug })}
                  onClick={() => setProjectSlug(p.slug)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition hover:bg-muted/60",
                    projectSlug === p.slug &&
                      "bg-[#0F2744]/[0.06] font-medium text-[#0F2744]"
                  )}
                >
                  {p.name}
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {agencies.length === 0
            ? "لا وكالات مطابقة حالياً — جرّب منطقة أو مشروعاً آخر."
            : `${agencies.length} وكالة`}
        </p>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {agencies.map((agency) => (
            <li key={agency.id}>
              <Link
                href={`/agencies/${encodeURIComponent(agency.slug)}`}
                className="flex items-center gap-3 px-3.5 py-3.5 transition-colors hover:bg-[#f7f3ec]/80"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {agency.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agency.logoUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Building2 className="size-5 text-[color:var(--brand-gold)]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#0F2744]">
                    {agency.officeName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {agency.locationLabel}
                  </p>
                  {agency.projectNames.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {agency.projectNames.slice(0, 3).map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="rounded-md text-[0.65rem]"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
