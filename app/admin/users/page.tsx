import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "المستخدمون",
}

export default function AdminUsersPage() {
  return (
    <PlaceholderPage
      title="المستخدمون"
      description="إدارة المستخدمين والأدوار. بلا اتصال بقاعدة المستخدمين في سبرنت 0."
    />
  )
}
