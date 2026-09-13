import type { Metadata } from "next"

import { FormPlaceholder } from "@/components/forms"
import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "تواصل",
}

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="تواصل"
      description="صفحة تواصل عامة للمنصة. طلبات العقارات تُدار لاحقاً عبر ContactLead وليس من هنا."
    >
      <FormPlaceholder note="لا يوجد إرسال أو تخزين لرسائل التواصل في سبرنت 0." />
    </PlaceholderPage>
  )
}
