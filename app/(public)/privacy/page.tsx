import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "الخصوصية",
}

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="خصوصية"
      description="مسودة سياسة الخصوصية. سيُستكمل النص القانوني قبل الإطلاق."
    />
  )
}
