import type { Metadata } from "next"
import Link from "next/link"

import { FormPlaceholder } from "@/components/forms"

export const metadata: Metadata = {
  title: "دخول",
}

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">دخول</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        واجهة تسجيل الدخول فقط. لا يوجد اتصال بـ Supabase Auth في سبرنت 0.
      </p>
      <FormPlaceholder note="حقول البريد وكلمة المرور ستُربط لاحقاً. لا جلسات حقيقية الآن." />
      <div className="flex flex-col gap-2 text-sm">
        <Link href="/register" className="text-primary hover:underline">
          إنشاء حساب
        </Link>
        <Link href="/forgot-password" className="text-primary hover:underline">
          نسيت كلمة المرور
        </Link>
      </div>
    </div>
  )
}
