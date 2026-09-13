import type { Metadata } from "next"

import { FormPlaceholder } from "@/components/forms"
import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "إضافة عقار",
}

export default function NewPropertyPage() {
  return (
    <PlaceholderPage
      title="إضافة عقار"
      description="نموذج إنشاء إعلان. رفع الصور إلى Supabase Storage مؤجّل."
    >
      <FormPlaceholder note="لا حفظ للإعلان ولا رفع للصور في سبرنت 0." />
    </PlaceholderPage>
  )
}
