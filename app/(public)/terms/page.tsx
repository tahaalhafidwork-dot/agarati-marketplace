import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "الشروط",
}

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="شروط"
      description="مسودة شروط الاستخدام. لا تمثّل اتفاقاً قانونياً نهائياً في سبرنت 0."
    />
  )
}
