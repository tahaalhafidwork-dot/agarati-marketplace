import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

export const metadata: Metadata = {
  title: "طلبات التواصل",
}

export default function ContactLeadsPage() {
  return (
    <PlaceholderPage
      title="طلبات التواصل"
      description="صندوق ContactLead للمعلن. لا رسائل فورية ولا تخزين في سبرنت 0."
    />
  )
}
