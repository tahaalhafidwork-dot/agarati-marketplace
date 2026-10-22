import type { Metadata } from "next"
import Link from "next/link"
import { ClipboardList, Plus, Search } from "lucide-react"

import { MyPropertyRequestsList } from "@/components/property-requests/my-property-requests-list"
import { PropertyRequestCardView } from "@/components/property-requests/property-request-card"
import { PropertyRequestFilters } from "@/components/property-requests/property-request-filters"
import { PropertyRequestForm } from "@/components/property-requests/property-request-form"
import { listPropertyRequests } from "@/lib/actions/property-requests"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/db"
import { toPropertyRequestCard } from "@/lib/property-requests"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "طلبات العقار",
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(
  v: string | string[] | undefined
): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

const TABS = [
  { id: "browse", label: "تصفح الطلبات", icon: Search },
  { id: "new", label: "طلب عقار", icon: Plus },
] as const

export default async function PropertyRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const tabRaw = one(sp.tab) ?? "browse"
  // Legacy ?tab=mine folds into browse
  const tab = tabRaw === "new" ? "new" : "browse"

  const filters = {
    category: one(sp.category),
    deal: one(sp.deal),
    city: one(sp.city),
    status: one(sp.status),
    q: one(sp.q),
  }

  const user = await getSessionUser()

  const [browseRows, mineRows] =
    !isDatabaseConfigured() || !user
      ? [[], []]
      : await Promise.all([
          tab === "browse"
            ? listPropertyRequests(filters)
            : Promise.resolve([]),
          tab === "new"
            ? listPropertyRequests({}, { mineOnly: true, userId: user.id })
            : Promise.resolve([]),
        ])

  const cards = browseRows.map(toPropertyRequestCard)
  const mineCards = mineRows.map(toPropertyRequestCard)

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-[color:var(--brand-gold)]/30 bg-[#0F2744] px-4 py-5 text-[#f8f1e6] shadow-[0_20px_50px_-28px_rgba(15,39,68,0.7)] sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(184,149,108,0.35), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(248,241,230,0.08), transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] text-[color:var(--brand-gold)] uppercase">
            AGARATİ · WANTED
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            طلبات العقار
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#f8f1e6]/72">
            انشر مواصفات العقار الذي تبحث عنه، وتصفّح طلبات الآخرين وتواصل مع
            أصحابها مباشرة داخل المنصة.
          </p>
        </div>
      </section>

      <nav
        className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-sm"
        aria-label="أقسام طلبات العقار"
      >
        {TABS.map((t) => {
          const active = tab === t.id
          const Icon = t.icon
          const href =
            t.id === "browse"
              ? "/dashboard/property-requests"
              : `/dashboard/property-requests?tab=${t.id}`
          return (
            <Link
              key={t.id}
              href={href}
              className={cn(
                "inline-flex min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[#0F2744] text-[#f8f1e6] shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
            </Link>
          )
        })}
      </nav>

      {!isDatabaseConfigured() ? (
        <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
          اربط قاعدة البيانات أولاً — docs/SUPABASE_SETUP.md
        </p>
      ) : !user ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login?next=/dashboard/property-requests"
              className="font-semibold text-primary hover:underline"
            >
              سجّل الدخول
            </Link>{" "}
            لطلب عقار أو تصفح الطلبات والتواصل.
          </p>
        </div>
      ) : tab === "new" ? (
        <div className="space-y-6">
          <section id="my-requests" className="scroll-mt-20 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-[#0F2744]">
                طلباتي
              </h2>
              <p className="text-xs text-muted-foreground">
                عدّل أو احذف طلباتك بسرعة
              </p>
            </div>
            {mineCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/80 px-4 py-8 text-center text-sm text-muted-foreground">
                لا طلبات لديك بعد — املأ النموذج بالأسفل لإنشاء أول طلب.
              </div>
            ) : (
              <MyPropertyRequestsList items={mineCards} />
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-[#0F2744]">
                طلب عقار جديد
              </h2>
              <p className="text-xs text-muted-foreground">
                صف العقار الذي تبحث عنه ليصلك المهتمون
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <PropertyRequestForm mode="create" />
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[#0F2744]">
              كل الطلبات المفتوحة
            </h2>
            <p className="text-xs text-muted-foreground">
              تصفّح وفلتر طلبات الباحثين عن عقار
            </p>
          </div>

          <PropertyRequestFilters tab="browse" filters={filters} />

          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-14 text-center">
              <ClipboardList className="mx-auto mb-3 size-10 text-muted-foreground/35" />
              <p className="text-sm font-medium text-foreground">
                لا طلبات مطابقة
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                جرّب تعديل الفلاتر أو أنشئ طلباً جديداً.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((item) => (
                <li key={item.id}>
                  <PropertyRequestCardView
                    item={item}
                    highlight={item.ownerId === user.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
