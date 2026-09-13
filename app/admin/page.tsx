import type { Metadata } from "next"

import { ModerationNote } from "@/components/admin"
import { DashboardStat } from "@/components/dashboard"
import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "الإدارة",
}

export default function AdminOverviewPage() {
  return (
    <PlaceholderPage
      title="نظرة عامة"
      description="لوحة مشرف للمنصة. المراجعة مطلوبة قبل الإطلاق، لكن دون منطق موافقة هنا."
    >
      <div className="mt-6 grid grid-cols-2 gap-3">
        <DashboardStat label="بانتظار المراجعة" value="—" />
        <DashboardStat label="مستخدمون" value="—" />
      </div>
      <ModerationNote />
    </PlaceholderPage>
  )
}
