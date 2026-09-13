import type { Metadata } from "next"
import Link from "next/link"

import { PropertyCardPlaceholder } from "@/components/property"
import { SearchFiltersPlaceholder } from "@/components/search"
import { PAGE_SIZE } from "@/lib/constants"

export const metadata: Metadata = {
  title: "العقارات",
}

const listings = [
  { slug: "ornek-daire", title: "شقة للبيع في كاديكوي", area: "إسطنبول · كاديكوي" },
  { slug: "ankara-ofis", title: "مكتب في مركز أنقرة", area: "أنقرة · تشانكايا" },
  { slug: "antalya-villa", title: "فيلا في أنطاليا", area: "أنطاليا · كونيالتي" },
]

export default function PropertiesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        العقارات
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
        قائمة عامة للعقارات. الفلاتر تُحفظ في الرابط لاحقاً، وحجم الصفحة {PAGE_SIZE}{" "}
        إعلاناً. لا يُعرض العنوان الدقيق للعامة.
      </p>
      <div className="mt-6">
        <SearchFiltersPlaceholder />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((item) => (
          <Link key={item.slug} href={`/properties/${item.slug}`}>
            <PropertyCardPlaceholder title={item.title} area={item.area} />
          </Link>
        ))}
      </div>
    </div>
  )
}
