import type { Metadata } from "next"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { ReportForm } from "@/components/support/report-form"

export const metadata: Metadata = {
  title: "تقديم بلاغ",
  description: "أبلغ عن مخالفة أو مشكلة عبر منصة أغاراتي.",
}

export default function SupportReportPage() {
  return (
    <div className="mx-auto w-full max-w-lg pb-10">
      <AppSubHeader title="تقديم بلاغ" backHref="/support" />
      <div className="space-y-3 px-4 pt-2">
        <p className="text-sm leading-6 text-muted-foreground">
          قدّم تفاصيل كافية وقابلة للتحقق. البلاغات تُراجع وفق الأولوية ولا تعني
          إدانة مسبقة لأي معلن أو مستخدم.
        </p>
        <ReportForm />
      </div>
    </div>
  )
}
