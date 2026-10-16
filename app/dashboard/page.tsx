import type { Metadata } from "next"

import { DashboardStat } from "@/components/dashboard"
import { PlaceholderPage } from "@/components/layout/placeholder-page"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "لوحة التحكم",
}

export default async function DashboardOverviewPage() {
  const user = await getSessionUser()
  let listings = "—"
  let favorites = "—"
  let requests = "—"

  if (user && isDatabaseConfigured()) {
    const [listingCount, favoriteCount, requestCount] = await Promise.all([
      prisma.listing.count({ where: { ownerId: user.id } }),
      prisma.favorite.count({ where: { userId: user.id } }),
      prisma.propertyRequest.count({ where: { userId: user.id } }),
    ])
    listings = String(listingCount)
    favorites = String(favoriteCount)
    requests = String(requestCount)
  }

  return (
    <PlaceholderPage
      title="نظرة عامة"
      description="ملخص حسابك. افتح عقاراتي أو المفضلة لمتابعة نشاطك."
    >
      <div className="mt-6 grid grid-cols-2 gap-3">
        <DashboardStat label="إعلانات" value={listings} />
        <DashboardStat label="المفضلة" value={favorites} />
        <DashboardStat label="طلبات العقار" value={requests} />
      </div>
    </PlaceholderPage>
  )
}
