import type { Metadata } from "next"

import { AgenciesDirectoryClient } from "@/components/agencies/agencies-directory-client"
import { AppSubHeader } from "@/components/layout/app-sub-header"
import {
  fetchApprovedAgencies,
  listProjects,
} from "@/lib/agency-directory"

export const metadata: Metadata = {
  title: "الوكالات",
}

type Props = {
  searchParams: Promise<{
    mode?: string
    city?: string
    district?: string
    neighborhood?: string
    project?: string
  }>
}

export default async function AgenciesPage({ searchParams }: Props) {
  const sp = await searchParams
  const mode = sp.mode === "project" ? "project" : "region"
  const city = sp.city?.trim() || undefined
  const district = sp.district?.trim() || undefined
  const neighborhood = sp.neighborhood?.trim() || undefined
  const project = sp.project?.trim() || undefined

  const projects = await listProjects(undefined, 120)
  const agencies = await fetchApprovedAgencies(
    mode === "project"
      ? { projectSlug: project }
      : city || district || neighborhood
        ? { city, district, neighborhood }
        : {}
  )

  return (
    <div className="mx-auto w-full max-w-7xl pb-8">
      <AppSubHeader title="الوكالات" backHref="/" />
      <div className="space-y-3 px-3 py-4 md:px-4">
        <p className="text-sm text-muted-foreground">
          ابحث عن وكيل عقاري حسب المنطقة أو المشروع السكني — الوكالات المعروضة
          موافق عليها من الإدارة.
        </p>
        <AgenciesDirectoryClient
          initialMode={mode}
          initialCity={city}
          initialDistrict={district}
          initialNeighborhood={neighborhood}
          initialProject={project}
          projects={projects.map((p) => ({ slug: p.slug, name: p.name }))}
          agencies={agencies}
        />
      </div>
    </div>
  )
}
