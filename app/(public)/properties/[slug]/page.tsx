import type { Metadata } from "next"
import Link from "next/link"

import { FormPlaceholder } from "@/components/forms"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "تفاصيل العقار",
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <p className="text-sm text-muted-foreground">عقار · {slug}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
        تفاصيل العقار
      </h1>
      <div className="mt-6 aspect-[4/3] rounded-xl bg-muted" />
      <p className="mt-6 text-base leading-7 text-muted-foreground">
        حي كاديكوي، إسطنبول. العنوان الدقيق لا يظهر للعامة — يظهر الحي أو
        المنطقة فقط حتى يتم التواصل.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/login" className={buttonVariants()}>
          حفظ في المفضلة
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline" })}
        >
          طلب تواصل
        </Link>
      </div>
      <FormPlaceholder note="نماذج التواصل والمفضلة بلا حفظ في سبرنت 0." />
    </div>
  )
}
