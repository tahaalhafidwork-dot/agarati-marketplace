import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "الوكالات",
}

export default function AgenciesPage() {
  return (
    <PlaceholderPage
      eyebrow="معلومات فقط"
      title="الوكالات"
      description="هذه الصفحة توضيحية. أغاراتي لا تطلق دليل وكالات أو نظام إدارة علاقات في النسخة الأولى — الوكالة دور حساب وليست منتجاً مستقلاً."
    />
  )
}
