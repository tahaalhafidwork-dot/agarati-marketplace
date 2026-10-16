import type { Metadata } from "next"

import { NewListingForm } from "./listing-form"
import { listApprovedProjectsForComplexes } from "@/lib/complex-options"

export const metadata: Metadata = {
  title: "إضافة عقار",
}

export default async function NewPropertyPage() {
  const projects = await listApprovedProjectsForComplexes()
  return (
    <NewListingForm
      catalogProjects={projects.map((p) => ({
        slug: p.slug,
        name: p.name,
        citySlug: p.citySlug,
        districtSlug: p.districtSlug,
        neighborhoodSlug: p.neighborhoodSlug,
      }))}
    />
  )
}
