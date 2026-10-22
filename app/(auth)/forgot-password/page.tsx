import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
