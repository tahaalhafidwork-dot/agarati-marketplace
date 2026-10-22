import { redirect } from "next/navigation"

import { AgencySubscriptionRequestButton } from "@/components/agency/agency-dashboard-forms"
import { HistoryBackButton } from "@/components/navigation/history-back-button"
import { Badge } from "@/components/ui/badge"
import { getSessionUser } from "@/lib/auth"
import { getActiveAgencyMembership } from "@/lib/agency-service"
import { prisma } from "@/lib/db"

export default async function AgencySubscriptionPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?next=/dashboard/agency/subscription")
  const membership = await getActiveAgencyMembership(user.id)
  if (!membership || membership.role !== "OWNER") redirect("/dashboard")
  const [subscriptions, payments] = await Promise.all([
    prisma.agencySubscription.findMany({
      where: { agencyId: membership.agencyId },
      orderBy: { endsAt: "desc" },
      take: 12,
    }),
    prisma.paymentRequest.findMany({
      where: { agencyId: membership.agencyId, purpose: "AGENCY_SUBSCRIPTION" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ])
  const active = subscriptions.find((item) => item.startsAt <= new Date() && item.endsAt > new Date())

  return (
    <div className="space-y-5">
      <HistoryBackButton fallbackHref="/dashboard/agency" />
      <header>
        <h1 className="text-xl font-semibold text-[#0F2744]">الاشتراك والدفعات</h1>
        <p className="mt-1 text-sm text-muted-foreground">اشتراك الوكالة 40,000 د.ع لكل 30 يومًا، وحده 30 إعلانًا إجمالًا.</p>
      </header>
      <section className="rounded-2xl border border-[color:var(--brand-gold)]/30 bg-[linear-gradient(145deg,#fffdf9,#faf6ef)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">الحالة الحالية</p>
            <p className="mt-1 text-lg font-semibold text-[#0F2744]">{active ? "اشتراك نشط" : "الاشتراك غير نشط"}</p>
            {active ? <p className="mt-1 text-xs text-muted-foreground">حتى {active.endsAt.toLocaleString("ar-IQ-u-nu-latn")}</p> : null}
          </div>
          <Badge variant={active ? "secondary" : "outline"}>{active ? "نشط" : "متوقف"}</Badge>
        </div>
        <div className="mt-5"><AgencySubscriptionRequestButton /></div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold text-[#0F2744]">سجل طلبات الدفع</h2>
        {payments.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">لا توجد طلبات بعد.</p> : (
          <ul className="mt-3 divide-y divide-border">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div><p className="font-medium">{payment.amountIqd.toLocaleString("en-US")} د.ع</p><p className="text-xs text-muted-foreground">{payment.createdAt.toLocaleString("ar-IQ-u-nu-latn")}</p></div>
                <Badge variant="outline">{payment.status === "PENDING" ? "قيد المراجعة" : payment.status === "APPROVED" ? "معتمد" : "مرفوض"}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
