import type { Metadata } from "next"

import { FormPlaceholder } from "@/components/forms"
import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "تعديل عقار",
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <PlaceholderPage
      eyebrow={`معرّف تجريبي: ${id}`}
      title="تعديل عقار"
      description="شاشة تعديل إعلان. بلا تحميل من قاعدة البيانات أو حفظ."
    >
      <FormPlaceholder note="لا تُطبَّق تعديلات ولا يُرفع مخزون صور في سبرنت 0." />
    </PlaceholderPage>
  )
}
