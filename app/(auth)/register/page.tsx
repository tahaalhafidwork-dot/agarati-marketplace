import type { Metadata } from "next"
import Link from "next/link"

import { FormPlaceholder } from "@/components/forms"

export const metadata: Metadata = {
  title: "إنشاء حساب",
}

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">إنشاء حساب</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        تسجيل حساب مالك أو وكالة سيأتي مع المصادقة الحقيقية. هذه صفحة مكانية.
      </p>
      <FormPlaceholder note="لا يُنشأ مستخدم ولا يُرسل بريد تحقق في سبرنت 0." />
      <Link href="/login" className="text-sm text-primary hover:underline">
        لديك حساب؟ دخول
      </Link>
    </div>
  )
}
