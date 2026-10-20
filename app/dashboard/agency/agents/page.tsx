import { redirect } from "next/navigation"

import { AgencyQuotaForm, InviteAgentForm } from "@/components/agency/agency-dashboard-forms"
import { Button } from "@/components/ui/button"
import { leaveAgencyAction, removeAgencyAgentAction, revokeAgencyInvitationAction } from "@/lib/actions/agency"
import { getSessionUser } from "@/lib/auth"
import { getActiveAgencyMembership, getAgencyMemberQuotaSnapshot } from "@/lib/agency-service"
import { prisma } from "@/lib/db"

export default async function AgencyAgentsPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?next=/dashboard/agency/agents")
  const membership = await getActiveAgencyMembership(user.id)
  if (!membership) redirect("/dashboard/agency")
  const quotas = await getAgencyMemberQuotaSnapshot(membership.agencyId)

  if (membership.role !== "OWNER") {
    const own = quotas.find((row) => row.userId === user.id)
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-[#0F2744]">حصتي في الوكالة</h1>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-3xl font-semibold tabular-nums text-[#0F2744]">{own?.used ?? 0}/{own?.quota ?? 0}</p>
          <p className="mt-1 text-sm text-muted-foreground">إعلانات وكالة مستخدمة من حصتك الحالية</p>
        </div>
        <form action={leaveAgencyAction}>
          <Button variant="destructive">مغادرة الوكالة</Button>
          <p className="mt-2 text-xs text-muted-foreground">تبقى عقارات الوكالة محفوظة ويستطيع صاحبها إعادة تعيين المسؤول.</p>
        </form>
      </div>
    )
  }

  const invitations = await prisma.agencyInvitation.findMany({
    where: { agencyId: membership.agencyId, status: "PENDING", expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold text-[#0F2744]">الوكلاء والحصص</h1>
        <p className="mt-1 text-sm text-muted-foreground">دوران فقط: صاحب الوكالة والوكيل.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <AgencyQuotaForm
          mode={membership.agency.quotaMode}
          members={quotas.map((member) => ({
            userId: member.userId,
            name: member.user.name,
            used: member.used,
            quota: member.quota,
          }))}
        />
        <InviteAgentForm />
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-semibold text-[#0F2744]">الأعضاء النشطون</h2>
        </div>
        <ul className="divide-y divide-border">
          {quotas.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.user.email} · {member.role === "OWNER" ? "صاحب الوكالة" : "وكيل"}</p>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{member.used}/{member.quota}</span>
              {member.role === "AGENT" ? (
                <form action={removeAgencyAgentAction}>
                  <input type="hidden" name="membershipId" value={member.id} />
                  <Button variant="destructive" size="sm">إزالة</Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      {invitations.length ? (
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-semibold text-[#0F2744]">دعوات معلقة</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {invitations.map((invite) => (
              <li key={invite.id} className="flex justify-between gap-3 py-2">
                <span dir="ltr">{invite.emailNormalized}</span>
                <span className="ms-auto text-xs text-muted-foreground">تنتهي {invite.expiresAt.toLocaleDateString("ar-IQ-u-nu-latn")}</span>
                <form action={revokeAgencyInvitationAction}>
                  <input type="hidden" name="invitationId" value={invite.id} />
                  <Button size="xs" variant="ghost">إلغاء</Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
