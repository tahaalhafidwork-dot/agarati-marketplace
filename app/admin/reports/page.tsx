import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { isDatabaseConfigured, prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "البلاغات",
}

const KIND_LABEL: Record<string, string> = {
  MISLEADING_LISTING: "إعلان مضلّل",
  FRAUD: "احتيال",
  ILLEGAL_CONTENT: "محتوى مخالف",
  IMPERSONATION: "انتحال",
  TECHNICAL: "تقني",
  OTHER: "أخرى",
}

const STATUS_LABEL: Record<string, string> = {
  NEW: "جديد",
  REVIEWING: "قيد المراجعة",
  RESOLVED: "مغلق",
  DISMISSED: "مرفوض",
}

export default async function AdminReportsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-[#0F2744]">البلاغات</h1>
          <p className="text-sm text-muted-foreground">
            قاعدة البيانات غير مُعدّة — لا يمكن عرض البلاغات.
          </p>
        </div>
      </div>
    )
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { name: true, email: true } },
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#0F2744]">البلاغات</h1>
        <p className="text-sm text-muted-foreground">
          وارد الدعم العام — {reports.length} بلاغ معروض (الأحدث أولاً).
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          لا بلاغات بعد.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {reports.map((row) => (
            <li key={row.id} className="space-y-2 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                  {row.referenceCode}
                </span>
                <Badge variant="secondary" className="rounded-sm text-[0.65rem]">
                  {KIND_LABEL[row.kind] ?? row.kind}
                </Badge>
                <Badge variant="outline" className="rounded-sm text-[0.65rem]">
                  {STATUS_LABEL[row.status] ?? row.status}
                </Badge>
                <span className="ms-auto text-[0.7rem] text-muted-foreground">
                  {row.createdAt.toLocaleString("ar-IQ")}
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-6 text-foreground">
                {row.description}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {row.listingRef ? (
                  <span dir="ltr">مرجع: {row.listingRef}</span>
                ) : null}
                {row.contactEmail ? (
                  <span dir="ltr">{row.contactEmail}</span>
                ) : null}
                {row.contactPhone ? (
                  <span dir="ltr">{row.contactPhone}</span>
                ) : null}
                {row.reporter ? (
                  <span>
                    مستخدم: {row.reporter.name} ({row.reporter.email})
                  </span>
                ) : (
                  <span>زائر غير مسجّل</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
