import type { Metadata } from "next"
import Link from "next/link"
import { Building2, Clock3, Mail } from "lucide-react"

import { AcceptInvitationForm } from "@/components/agency/accept-invitation-form"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getAgencyInvitationByToken } from "@/lib/agency-membership-service"
import { getSessionUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "دعوة وكالة عقارية" }

export default async function AgencyInvitationPage({ params }: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const [invitation, user] = await Promise.all([
    getAgencyInvitationByToken(token),
    getSessionUser(),
  ])
  const available = Boolean(
    invitation && invitation.status === "PENDING" && invitation.expiresAt > new Date()
  )

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-[color:var(--brand-gold)]/30 bg-card p-5 shadow-[0_20px_60px_rgba(15,39,68,0.10)] md:p-7">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0F2744] text-[color:var(--brand-gold)]">
          <Building2 className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-[#0F2744]">دعوة للانضمام إلى وكالة</h1>
        {!invitation ? (
          <p className="mt-3 text-sm text-red-700">رابط الدعوة غير صحيح أو لم يعد موجودًا.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="font-semibold text-[#0F2744]">{invitation.agency.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">دعوة من {invitation.invitedBy.name}</p>
            </div>
            <p className="flex items-center gap-2 text-sm"><Mail className="size-4 text-muted-foreground" /><span dir="ltr">{invitation.emailNormalized}</span></p>
            <p className="flex items-center gap-2 text-sm"><Clock3 className="size-4 text-muted-foreground" />صالحة حتى {invitation.expiresAt.toLocaleString("ar-IQ-u-nu-latn")}</p>
            <Badge variant="outline">دور وكيل — لا يُنشأ حساب منفصل</Badge>
            {!available ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">انتهت الدعوة أو استُخدمت سابقًا.</p>
            ) : !user ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href={`/login?next=${encodeURIComponent(`/agency/invitations/${token}`)}`} className={cn(buttonVariants(), "w-full")}>
                  تسجيل الدخول للقبول
                </Link>
                <Link href={`/register?next=${encodeURIComponent(`/agency/invitations/${token}`)}`} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  إنشاء حساب جديد
                </Link>
              </div>
            ) : (
              <>
                {user.email.toLowerCase() !== invitation.emailNormalized ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">سجّلت الدخول بالبريد {user.email}. استخدم البريد الموجّهة إليه الدعوة.</p>
                ) : null}
                <AcceptInvitationForm token={token} />
              </>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
