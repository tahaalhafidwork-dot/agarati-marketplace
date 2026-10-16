import type { Metadata } from "next"

import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: "إنشاء حساب",
}

export default function RegisterPage() {
  return <SignupForm />
}
