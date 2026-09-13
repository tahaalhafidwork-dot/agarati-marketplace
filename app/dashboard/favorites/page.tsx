import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "المفضلة",
}

export default function FavoritesPage() {
  return (
    <PlaceholderPage
      eyebrow="مانع إطلاق"
      title="المفضلة"
      description="المفضلة مطلوبة لإطلاق الـ MVP. هذه الشاشة مكانية — لا حفظ للمفضلة بعد."
    />
  )
}
