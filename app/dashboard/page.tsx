import type { Metadata } from "next"

import { DashboardStat } from "@/components/dashboard"
import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "لوحة التحكم",
}

export default function DashboardOverviewPage() {
  return (
    <PlaceholderPage
      title="نظرة عامة"
      description="ملخص حساب المعلن. الأرقام أدناه تجريبية ولا تُقرأ من قاعدة بيانات."
    >
      <div className="mt-6 grid grid-cols-2 gap-3">
        <DashboardStat label="إعلانات" value="—" />
        <DashboardStat label="المفضلة" value="—" />
        <DashboardStat label="طلبات التواصل" value="—" />
      </div>
    </PlaceholderPage>
  )
}
