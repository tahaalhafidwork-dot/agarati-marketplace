import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { approvePaymentAction, rejectPaymentAction } from "@/lib/actions/payments"
import { prisma } from "@/lib/db"

export default async function AdminPaymentsPage() {
  const payments = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      requestedBy: { select: { name: true, email: true } },
      agency: { select: { name: true } },
      listing: { select: { title: true } },
    },
  })
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-[#0F2744]">طلبات الدفع</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          الاعتماد عملية idempotent؛ تكرار الطلب لا يكرر مدة الإعلان أو الاشتراك.
        </p>
      </header>
      {payments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">لا توجد طلبات دفع.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {payments.map((payment) => (
            <li key={payment.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#0F2744]">
                    {payment.purpose === "AGENCY_SUBSCRIPTION" ? `اشتراك ${payment.agency?.name ?? "وكالة"}` : `إعلان: ${payment.listing?.title ?? "محذوف"}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{payment.requestedBy.name} · {payment.requestedBy.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{payment.createdAt.toLocaleString("ar-IQ-u-nu-latn")}</p>
                </div>
                <div className="text-end">
                  <p className="font-semibold tabular-nums">{payment.amountIqd.toLocaleString("en-US")} د.ع</p>
                  <Badge variant="outline" className="mt-1">{payment.status === "PENDING" ? "قيد المراجعة" : payment.status === "APPROVED" ? "معتمد" : "مرفوض"}</Badge>
                </div>
              </div>
              {payment.status === "PENDING" ? (
                <div className="flex flex-wrap gap-2">
                  <form action={approvePaymentAction} className="flex flex-1 gap-2">
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input name="externalReference" required placeholder="مرجع التحويل الفريد" className="h-8 min-w-0 flex-1 rounded-lg border border-input px-2 text-sm" />
                    <Button size="sm">اعتماد وتطبيق</Button>
                  </form>
                  <form action={rejectPaymentAction} className="flex gap-2">
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input name="reason" placeholder="سبب الرفض" className="h-8 w-36 rounded-lg border border-input px-2 text-sm" />
                    <Button size="sm" variant="destructive">رفض</Button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
