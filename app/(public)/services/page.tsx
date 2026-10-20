import type { Metadata } from "next"

import {
  AppSubHeader,
  CategoryRowLink,
} from "@/components/layout/app-sub-header"

export const metadata: Metadata = {
  title: "الخدمات",
}

const SERVICE_ROWS = [
  {
    slug: "agencies",
    label: "البحث عن الوكالات",
    description: "اعثر على وكيل حسب المنطقة أو المشروع السكني",
    href: "/agencies",
  },
  {
    slug: "property-request",
    label: "طلب عقار",
    description: "صف ما تبحث عنه ويستلم الوسطاء طلبك",
    href: "/dashboard/property-requests",
  },
  {
    slug: "area-prices",
    label: "أسعار العقارات حسب المناطق",
    description: "متوسطات البيع والإيجار عند توفر بيانات كافية",
    comingSoon: true,
  },
  {
    slug: "appraisal",
    label: "التقييم العقاري",
    description:
      "طلب تقييم مهني للعقار عبر خبراء معتمدين",
    comingSoon: true,
  },
  {
    slug: "property-photography",
    label: "تصوير عقاري",
    description: "حجز مصوّر محترف لصور وفيديوهات الإعلان",
    comingSoon: true,
  },
  {
    slug: "poster",
    label: "إنشاء بوستر",
    description: "تصميم إعلان بصري سريع لمشاركتك العقارية",
    comingSoon: true,
  },
] as const

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AppSubHeader title="الخدمات" backHref="/" />
      <p className="border-b border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        خدمات تكمّل رحلة البحث والعرض: من إيجاد الوكيل المناسب وطلب عقار، إلى
        أدوات إضافية تُفعَّل تباعاً.
      </p>
      <div className="border-b border-border bg-card">
        {SERVICE_ROWS.map((row) => (
          <CategoryRowLink
            key={row.slug}
            label={row.label}
            description={row.description}
            href={"href" in row ? row.href : undefined}
            comingSoon={"comingSoon" in row && row.comingSoon}
          />
        ))}
      </div>
    </div>
  )
}
