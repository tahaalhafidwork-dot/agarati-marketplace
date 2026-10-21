import Link from "next/link"
import { redirect } from "next/navigation"
import { Building2, CalendarDays, ListChecks, Users } from "lucide-react"

import { AgencyProfileForm } from "@/components/agency/agency-dashboard-forms"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth"
import {
  getActiveAgencyMembership,
  getAgencyMemberQuotaSnapshot,
} from "@/lib/agency-service"
import { prisma } from "@/lib/db"
import { cn } from "@/lib/utils"

export default async function AgencyDashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?next=/dashboard/agency")
  const membership = await getActiveAgencyMembership(user.id)
  if (!membership || membership.role !== "OWNER") redirect("/dashboard")

  const [quotas, activeCount, latestSubscription, pendingPayment] = await Promise.all([
    getAgencyMemberQuotaSnapshot(membership.agencyId),
    prisma.listing.count({
      where: { agencyId: membership.agencyId, status: { in: ["PENDING", "ACTIVE"] } },
    }),
    prisma.agencySubscription.findFirst({
      where: { agencyId: membership.agencyId, status: "ACTIVE" },
      orderBy: { endsAt: "desc" },
    }),
    prisma.paymentRequest.findFirst({
      where: { agencyId: membership.agencyId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ])
  const ownQuota = quotas.find((row) => row.userId === user.id)
  const subscriptionActive = Boolean(
    latestSubscription &&
      latestSubscription.startsAt <= new Date() &&
      latestSubscription.endsAt > new Date()
  )

  const stats = [
    { icon: ListChecks, label: "الإعلانات المستخدمة", value: `${activeCount}/30` },
    { icon: Users, label: "أعضاء الوكالة", value: String(quotas.length) },
    { icon: Building2, label: "حصتك", value: `${ownQuota?.used ?? 0}/${ownQuota?.quota ?? 0}` },
    {
      icon: CalendarDays,
      label: "الاشتراك",
      value: subscriptionActive ? "نشط" : pendingPayment ? "قيد المراجعة" : "غير نشط",
    },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#0F2744]">{membership.agency.name}</h1>
            <Badge variant="outline">صاحب الوكالة</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">إدارة العقارات والحصص والاشتراك من مكان واحد.</p>
        </div>
        <Link href={`/agencies/${membership.agency.slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
          الصفحة العامة
        </Link>
      </header>

      {!subscriptionActive ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          الاشتراك غير نشط؛ تبقى البيانات محفوظة لكن عقارات الوكالة لا تظهر للعامة حتى التجديد.
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
            <Icon className="size-4 text-[color:var(--brand-gold)]" />
            <p className="mt-3 text-xl font-semibold tabular-nums text-[#0F2744]">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/dashboard/properties" className="rounded-xl border border-border bg-card p-4 hover:border-[#B8956C]/60">
          <p className="font-medium text-[#0F2744]">عقارات الوكالة</p>
          <p className="mt-1 text-xs text-muted-foreground">النشر والتعديل وإعادة التعيين</p>
        </Link>
        <Link href="/dashboard/agency/agents" className="rounded-xl border border-border bg-card p-4 hover:border-[#B8956C]/60">
          <p className="font-medium text-[#0F2744]">الوكلاء والحصص</p>
          <p className="mt-1 text-xs text-muted-foreground">الدعوات والتوزيع والمغادرة</p>
        </Link>
        <Link href="/dashboard/agency/subscription" className="rounded-xl border border-border bg-card p-4 hover:border-[#B8956C]/60">
          <p className="font-medium text-[#0F2744]">الاشتراك والدفعات</p>
          <p className="mt-1 text-xs text-muted-foreground">30 يومًا مقابل 40,000 د.ع</p>
        </Link>
      </div>

      <AgencyProfileForm agency={membership.agency} />
    </div>
  )
}
