import type { Metadata } from "next"
import Link from "next/link"

import { PlaceholderPage } from "@/components/layout/placeholder-page"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "عقاراتي",
}

export default function DashboardPropertiesPage() {
  return (
    <PlaceholderPage
      title="عقاراتي"
      description="قائمة إعلانات المعلن. لا استعلامات Prisma في سبرنت 0."
    >
      <Link
        href="/dashboard/properties/new"
        className={`${buttonVariants({ size: "lg" })} mt-6`}
      >
        إضافة عقار
      </Link>
    </PlaceholderPage>
  )
}
