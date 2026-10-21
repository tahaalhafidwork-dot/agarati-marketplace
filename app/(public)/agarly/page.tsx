import type { Metadata } from "next"

import { AgarlySearchExperience } from "@/components/agarly/agarly-search-experience"
import { getSessionUser } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Agarly AI — البحث العقاري الذكي",
  description: "صف احتياجك العقاري بالعربية وسيحوّله Agarly إلى فلاتر آمنة على إعلانات AGARATİ الحقيقية.",
}

export default async function AgarlyPage() {
  const user = await getSessionUser()
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || "kilo"
  const providerConfigured =
    provider === "openai"
      ? Boolean(process.env.OPENAI_API_KEY?.trim())
      : provider === "kilo" && Boolean(process.env.KILO_API_KEY?.trim())

  return (
    <AgarlySearchExperience
      sessionPresent={Boolean(user)}
      providerConfigured={providerConfigured}
    />
  )
}
