import { cache } from "react"
import { cookies } from "next/headers"
import type {
  AccountType,
  AgencyUpgradeStatus,
  User as DbUser,
  UserRole,
} from "@prisma/client"

import { isDatabaseConfigured, isDatabaseReachable, prisma } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

const AUTH_TIMEOUT_MS = 2_000

function hasSupabaseAuthCookie(
  list: { name: string }[]
): boolean {
  return list.some(
    (c) =>
      c.name.startsWith("sb-") &&
      (c.name.includes("auth-token") || c.name.includes("access-token"))
  )
}

export type SessionUser = {
  id: string
  email: string
  name: string
  phone: string | null
  whatsapp: string | null
  role: UserRole
  avatarUrl: string | null
  notifyMessages: boolean
  notifyOther: boolean
  accountType: AccountType
  agencyUpgradeStatus: AgencyUpgradeStatus
  agencyOfficeName: string | null
  agencyLogoUrl: string | null
  agencySocialUrl: string | null
  agencyRequestNote: string | null
  agencyRequestedAt: string | null
  agencyCitySlug: string | null
  agencyDistrictSlug: string | null
  agencyNeighborhoodSlug: string | null
  agencyAddressLine: string | null
  agencyBio: string | null
}

/**
 * Per-request memoization — layouts/pages/actions that call getSessionUser
 * in the same RSC pass share one Supabase + profile lookup.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null

  try {
    const cookieStore = await cookies()
    // Guest public traffic: never call Auth (unreachable host = multi-second retries).
    if (!hasSupabaseAuthCookie(cookieStore.getAll())) return null

    const supabase = await createClient()
    const authResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("AUTH_TIMEOUT")), AUTH_TIMEOUT_MS)
      }),
    ])
    const user = authResult.data.user
    if (!user?.email) return null

    if (!isDatabaseConfigured() || !(await isDatabaseReachable())) {
      return {
        id: user.id,
        email: user.email,
        name:
          (user.user_metadata?.name as string | undefined) ||
          user.email.split("@")[0],
        phone: (user.user_metadata?.phone as string | undefined) ?? null,
        whatsapp: (user.user_metadata?.phone as string | undefined) ?? null,
        role: "LISTER",
        avatarUrl: null,
        notifyMessages: true,
        notifyOther: true,
        accountType: "INDIVIDUAL",
        agencyUpgradeStatus: "NONE",
        agencyOfficeName: null,
        agencyLogoUrl: null,
        agencySocialUrl: null,
        agencyRequestNote: null,
        agencyRequestedAt: null,
        agencyCitySlug: null,
        agencyDistrictSlug: null,
        agencyNeighborhoodSlug: null,
        agencyAddressLine: null,
        agencyBio: null,
      }
    }

    const profile = await ensureUserProfile({
      id: user.id,
      email: user.email,
      name:
        (user.user_metadata?.name as string | undefined) ||
        user.email.split("@")[0],
      phone: (user.user_metadata?.phone as string | undefined) ?? null,
    })

    return toSessionUser(profile)
  } catch {
    return null
  }
})

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSessionUser()
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN")
  }
  return user
}

export async function ensureUserProfile(input: {
  id: string
  email: string
  name: string
  phone?: string | null
  /** Only applied on create — agency signup request awaiting admin. */
  agencyAtSignup?: {
    officeName: string
    note?: string | null
    logoUrl?: string | null
    socialUrl?: string | null
    citySlug: string
    districtSlug: string
    neighborhoodSlug: string
    addressLine: string
    bio?: string | null
  }
}): Promise<DbUser> {
  const agencyCreate = input.agencyAtSignup
    ? {
        accountType: "INDIVIDUAL" as const,
        agencyUpgradeStatus: "PENDING" as const,
        agencyOfficeName: input.agencyAtSignup.officeName,
        agencyLogoUrl: input.agencyAtSignup.logoUrl ?? null,
        agencySocialUrl: input.agencyAtSignup.socialUrl ?? null,
        agencyCitySlug: input.agencyAtSignup.citySlug,
        agencyDistrictSlug: input.agencyAtSignup.districtSlug,
        agencyNeighborhoodSlug: input.agencyAtSignup.neighborhoodSlug,
        agencyAddressLine: input.agencyAtSignup.addressLine,
        agencyBio: input.agencyAtSignup.bio ?? null,
        agencyRequestNote:
          input.agencyAtSignup.note?.trim() || "طلب عند التسجيل",
        agencyRequestedAt: new Date(),
      }
    : {
        accountType: "INDIVIDUAL" as const,
        agencyUpgradeStatus: "NONE" as const,
      }

  // Hot path: read-only when profile already exists (no write on every RSC).
  if (!input.agencyAtSignup) {
    const existing = await prisma.user.findUnique({ where: { id: input.id } })
    if (existing) {
      const needsTouch =
        existing.email !== input.email ||
        existing.name !== input.name ||
        (input.phone != null && existing.phone !== input.phone)
      if (!needsTouch) return existing
      return prisma.user.update({
        where: { id: input.id },
        data: {
          email: input.email,
          name: input.name,
          ...(input.phone != null ? { phone: input.phone } : {}),
        },
      })
    }
  }

  return prisma.user.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email,
      name: input.name,
      phone: input.phone ?? null,
      whatsapp: input.phone ?? null,
      role: "LISTER",
      ...agencyCreate,
    },
    update: {
      email: input.email,
      name: input.name,
      ...(input.phone != null ? { phone: input.phone } : {}),
    },
  })
}

function toSessionUser(user: DbUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    whatsapp: user.whatsapp,
    role: user.role,
    avatarUrl: user.avatarUrl,
    notifyMessages: user.notifyMessages,
    notifyOther: user.notifyOther,
    accountType: user.accountType,
    agencyUpgradeStatus: user.agencyUpgradeStatus,
    agencyOfficeName: user.agencyOfficeName,
    agencyLogoUrl: user.agencyLogoUrl,
    agencySocialUrl: user.agencySocialUrl,
    agencyRequestNote: user.agencyRequestNote,
    agencyRequestedAt: user.agencyRequestedAt?.toISOString() ?? null,
    agencyCitySlug: user.agencyCitySlug,
    agencyDistrictSlug: user.agencyDistrictSlug,
    agencyNeighborhoodSlug: user.agencyNeighborhoodSlug,
    agencyAddressLine: user.agencyAddressLine,
    agencyBio: user.agencyBio,
  }
}
