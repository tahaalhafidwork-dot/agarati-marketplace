import type { Metadata } from "next"

import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: "إنشاء حساب",
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const nextPath =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
  return <SignupForm nextPath={nextPath} />
}
