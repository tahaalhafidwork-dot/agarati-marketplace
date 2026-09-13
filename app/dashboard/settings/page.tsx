import type { Metadata } from "next"

import { FormPlaceholder } from "@/components/forms"
import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "الإعدادات",
}

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="الإعدادات"
      description="إعدادات الحساب والملف. لا تُحفظ تفضيلات في سبرنت 0."
    >
      <FormPlaceholder note="الملف الشخصي والمصادقة الحقيقية يأتيان في سبرنت لاحق." />
    </PlaceholderPage>
  )
}
