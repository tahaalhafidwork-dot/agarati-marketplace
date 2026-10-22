"use client"

import { Button } from "@/components/ui/button"

export default function AgencyError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
      <h2 className="font-semibold text-red-900">تعذّر تحميل بيانات الوكالة</h2>
      <p className="mt-1 text-sm text-red-800">لم تتغير بياناتك. حاول إعادة التحميل.</p>
      <Button className="mt-4" variant="outline" onClick={reset}>إعادة المحاولة</Button>
    </div>
  )
}
