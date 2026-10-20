import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { SITE_NAME_AR } from "@/lib/constants"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Agarly",
  description:
    "Agarly — بحث عقاري بالذكاء الاصطناعي قريباً على أغاراتي. اوصف ما تبحث عنه بلغة طبيعية.",
}

export default function AgarlyComingSoonPage() {
  return (
    <div className="relative isolate min-h-[calc(100dvh-3.5rem)] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(184,149,108,0.22),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(15,39,68,0.18),transparent_50%),linear-gradient(165deg,#f7f3ec_0%,#efe8dc_42%,#e7dfd2_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-24 top-16 size-72 rounded-full bg-brand-gold/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-16 bottom-10 size-80 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="mb-8 inline-flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_40px_rgba(15,39,68,0.28)]">
          <Sparkles className="size-7" strokeWidth={1.5} />
        </div>

        <p className="mb-3 text-[0.7rem] font-semibold tracking-[0.22em] text-brand-gold uppercase">
          قريباً على {SITE_NAME_AR}
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Agarly
        </h1>
        <p className="mt-2 text-base text-primary/70 sm:text-lg">
          بحث عقاري بلمسة ذكاء اصطناعي
        </p>

        <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
          اكتب ما تبحث عنه بلغة طبيعية — مثل «شقة عائلية في عنكاوا بميزانية
          محددة» — ودع Agarly تقترح الأنسب من الإعلانات. الميزة قيد التجهيز
          بعناية لتبقى التجربة بسيطة ودقيقة.
        </p>

        <div className="mt-10 w-full max-w-md rounded-2xl border border-primary/10 bg-card/80 p-1 shadow-[0_20px_50px_rgba(15,39,68,0.08)] backdrop-blur">
          <div className="rounded-[0.9rem] border border-dashed border-border/80 bg-muted/30 px-4 py-5 text-start">
            <p className="text-[0.65rem] font-medium text-muted-foreground">
              مثال على ما ستكتبه لاحقاً
            </p>
            <p className="mt-2 text-sm leading-6 text-primary/80">
              أبحث عن منزل هادئ قرب الخدمات في أربيل، غرفتين أو ثلاث، للإيجار…
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-[0.65rem] font-semibold text-primary">
                قيد الإعداد
              </span>
              <span className="text-[0.65rem] text-muted-foreground">
                غير متاح للتجربة بعد
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/categories"
            className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
          >
            تصفح العقارات الآن
            <ArrowRight className="size-4 rotate-180" />
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "bg-card/70"
            )}
          >
            العودة للرئيسية
          </Link>
        </div>

        <p className="mt-12 text-[0.7rem] text-muted-foreground">
          Agarly جزء من تجربة {SITE_NAME_AR} — ذكاء يخدم البحث، لا يُعقّده.
        </p>
      </div>
    </div>
  )
}
