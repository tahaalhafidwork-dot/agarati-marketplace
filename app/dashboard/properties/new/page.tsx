import type { Metadata } from "next"

import { NewListingForm } from "./listing-form"
import { listApprovedProjectsForComplexes } from "@/lib/complex-options"
import { getSessionUser } from "@/lib/auth"
import {
  getActiveAgencyMembership,
  getAgencyMemberQuotaSnapshot,
  hasActiveAgencySubscription,
} from "@/lib/agency-service"

export const metadata: Metadata = {
  title: "إضافة عقار",
}

export default async function NewPropertyPage() {
  const [projects, user] = await Promise.all([
    listApprovedProjectsForComplexes(),
    getSessionUser(),
  ])
  const membership = user ? await getActiveAgencyMembership(user.id) : null
  const agencyOption = membership
    ? await Promise.all([
        hasActiveAgencySubscription(membership.agencyId),
        getAgencyMemberQuotaSnapshot(membership.agencyId),
      ]).then(([subscriptionActive, quotas]) => {
        const own = quotas.find((row) => row.userId === user?.id)
        return {
          agencyName: membership.agency.name,
          role: membership.role,
          subscriptionActive,
          used: own?.used ?? 0,
          quota: own?.quota ?? 0,
        }
      })
    : null
  return (
    <NewListingForm
      agencyOption={agencyOption}
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
