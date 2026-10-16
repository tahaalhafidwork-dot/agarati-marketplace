/**
 * One-off: create an approved agency account for local browsing.
 *   npx tsx tools/create-approved-agency.ts
 */
import { config } from "dotenv"
config({ path: ".env.local", override: true })
config()

import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"

const EMAIL = "agency.demo@agarati.local"
const PASSWORD = "AgencyDemo123!"
const NAME = "مكتب أربيل التجريبي"
const OFFICE = "عقارات أربيل التجريبي"

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error("Missing Supabase env (URL / SERVICE_ROLE_KEY)")
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const prisma = new PrismaClient()

  try {
    // Remove prior demo auth user if present
    const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 })
    const existing = listed?.users?.find(
      (u) => u.email?.toLowerCase() === EMAIL.toLowerCase()
    )
    if (existing) {
      await admin.auth.admin.deleteUser(existing.id)
      await prisma.user.deleteMany({ where: { id: existing.id } }).catch(() => {})
      console.log("Removed previous demo agency user")
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: NAME, phone: "07501234567" },
    })
    if (error || !data.user) {
      throw new Error(error?.message ?? "createUser failed")
    }

    const id = data.user.id
    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email: EMAIL,
        name: NAME,
        phone: "07501234567",
        whatsapp: "07501234567",
        role: "LISTER",
        accountType: "AGENCY",
        agencyUpgradeStatus: "APPROVED",
        agencyOfficeName: OFFICE,
        agencyCitySlug: "erbil",
        agencyDistrictSlug: "erbil-center",
        agencyNeighborhoodSlug: "ankawa",
        agencyAddressLine: "شارع ٦٠ متر — مكتب تجريبي",
        agencyBio:
          "مكتب عقاري تجريبي معتمد للاختبار — مشاريع سكنية وروابط الدليل.",
        agencyRequestedAt: new Date(),
      },
      update: {
        email: EMAIL,
        name: NAME,
        accountType: "AGENCY",
        agencyUpgradeStatus: "APPROVED",
        agencyOfficeName: OFFICE,
        agencyCitySlug: "erbil",
        agencyDistrictSlug: "erbil-center",
        agencyNeighborhoodSlug: "ankawa",
        agencyAddressLine: "شارع ٦٠ متر — مكتب تجريبي",
        agencyBio:
          "مكتب عقاري تجريبي معتمد للاختبار — مشاريع سكنية وروابط الدليل.",
      },
    })

    console.log("OK — approved agency created")
    console.log(`email: ${EMAIL}`)
    console.log(`password: ${PASSWORD}`)
    console.log(`office: ${OFFICE}`)
    console.log("dashboard: /dashboard/agency-projects")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
