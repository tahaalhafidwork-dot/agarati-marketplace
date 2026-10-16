import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { getSessionUser } from "@/lib/auth"

export const metadata: Metadata = {
  title: "دخول",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const sp = await searchParams
  const next = sp.next?.startsWith("/") ? sp.next : "/dashboard"
  const user = await getSessionUser()
  if (user) {
    redirect(next)
  }
  return <LoginForm nextPath={next} />
}
