import Link from "next/link"

import { PropertyCardPlaceholder } from "@/components/property"
import { SearchFiltersPlaceholder } from "@/components/search"
import { buttonVariants } from "@/components/ui/button"

const samples = [
  { title: "شقة للبيع في كاديكوي", area: "إسطنبول · كاديكوي" },
  { title: "مكتب في مركز أنقرة", area: "أنقرة · تشانكايا" },
  { title: "فيلا في أنطاليا", area: "أنطاليا · كونيالتي" },
]

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <section className="max-w-2xl space-y-4">
        <p className="text-sm font-medium text-primary">أغاراتي</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          سوق عقاري مركّز لتركيا والمنطقة
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          ابحث عن بيع وإيجار طويل الأمد بواجهة عربية. سبرنت 0 يعرض الهيكل
          العام فقط — دون حسابات حقيقية أو قاعدة بيانات.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/properties" className={buttonVariants({ size: "lg" })}>
            تصفح العقارات
          </Link>
          <Link
            href="/agencies"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            عن الوكالات
          </Link>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">بحث سريع</h2>
        <SearchFiltersPlaceholder />
        <p className="text-sm text-muted-foreground">
          الفلاتر ستكون في عنوان الصفحة، وعدد النتائج في الصفحة 24.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">عقارات نموذجية</h2>
          <Link
            href="/properties"
            className="text-sm text-primary hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {samples.map((item) => (
            <Link key={item.title} href="/properties/ornek-daire">
              <PropertyCardPlaceholder title={item.title} area={item.area} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
