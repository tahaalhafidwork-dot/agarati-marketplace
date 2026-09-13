import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "البلاغات",
}

export default function AdminReportsPage() {
  return (
    <PlaceholderPage
      eyebrow="مؤجّل"
      title="البلاغات"
      description="البلاغات مؤجّلة بعد الإطلاق. هذه شاشة مكانية فقط ولن تُبنى في الـ MVP الأول."
    />
  )
}
