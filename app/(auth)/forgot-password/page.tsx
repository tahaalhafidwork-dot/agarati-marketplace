import type { Metadata } from "next"
import Link from "next/link"

import { FormPlaceholder } from "@/components/forms"

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        نسيت كلمة المرور
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">
        استعادة كلمة المرور عبر البريد ستُبنى مع Supabase Auth لاحقاً.
      </p>
      <FormPlaceholder note="لا تُرسل رسائل إعادة تعيين في سبرنت 0." />
      <Link href="/login" className="text-sm text-primary hover:underline">
        العودة لتسجيل الدخول
      </Link>
    </div>
  )
}
