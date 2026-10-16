import type { Metadata } from "next"
import Link from "next/link"
import { Flag, FileText, LifeBuoy, Mail, Shield } from "lucide-react"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "الدعم",
  description: "مركز دعم أغاراتي — بلاغات، تواصل، ووثائق قانونية.",
}

const cards = [
  {
    href: "/support/report",
    title: "تقديم بلاغ",
    description:
      "للإعلان المضلّل، الاحتيال، المحتوى المخالف، أو المشاكل التقنية الجدية.",
    icon: Flag,
    highlight: true,
  },
  {
    href: "/contact",
    title: "تواصل عام",
    description: "استفسارات غير عاجلة عن المنصة أو الشراكات.",
    icon: Mail,
    highlight: false,
  },
  {
    href: "/privacy",
    title: "سياسة الخصوصية",
    description: "كيف تُعالج بياناتك وما يظهر للعامة.",
    icon: Shield,
    highlight: false,
  },
  {
    href: "/terms",
    title: "شروط الاستخدام",
    description: "طبيعة المنصة وحدود المسؤولية والاستخدام المقبول.",
    icon: FileText,
    highlight: false,
  },
] as const

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <AppSubHeader title="الدعم" backHref="/" />
      <div className="space-y-5 px-4 pt-2">
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0F2744]/8 text-[color:var(--brand-gold)]">
              <LifeBuoy className="size-5" strokeWidth={1.75} />
            </span>
            <div className="space-y-1.5 text-sm">
              <h1 className="text-base font-semibold text-[#0F2744]">
                كيف نساعدك؟
              </h1>
              <p className="leading-6 text-muted-foreground">
                استخدم <strong className="text-foreground">البلاغ</strong> عند
                اشتباه بمخالفة أو ضرر على مستخدمين آخرين. للاستفسارات العامة
                استخدم التواصل. استلام البلاغ يعني بدء مراجعة معقولة — وليس وعداً
                بحل فوري أو انحيازاً لأي طرف.
              </p>
            </div>
          </div>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className={cn(
                    "flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:bg-[#faf6ef]/80",
                    card.highlight &&
                      "border-[color:var(--brand-gold)]/35 ring-1 ring-[color:var(--brand-gold)]/20"
                  )}
                >
                  <Icon
                    className="size-4 text-[color:var(--brand-gold)]"
                    strokeWidth={1.75}
                  />
                  <span className="text-sm font-semibold text-[#0F2744]">
                    {card.title}
                  </span>
                  <span className="text-xs leading-5 text-muted-foreground">
                    {card.description}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <Link
          href="/support/report"
          className={cn(buttonVariants(), "w-full sm:w-auto")}
        >
          <Flag className="size-4" />
          الانتقال لنموذج البلاغ
        </Link>
      </div>
    </div>
  )
}
