import type { Metadata } from "next"

import { ModerationNote } from "@/components/admin"
import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "مراجعة العقارات",
}

export default function AdminPropertiesPage() {
  return (
    <PlaceholderPage
      title="العقارات"
      description="قائمة مراجعة الإعلانات. لا موافقة ولا رفض في سبرنت 0."
    >
      <ModerationNote />
    </PlaceholderPage>
  )
}
