"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import {
  normalizeAgencySocialUrl,
  uploadAgencyLogoFile,
} from "@/lib/agency-assets"
import { ensureUserProfile } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/db"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"

export type AuthActionState = {
  error?: string
  success?: string
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase غير مُعد. راجع docs/SUPABASE_SETUP.md" }
  }
  if (!isDatabaseConfigured()) {
    return { error: "DATABASE_URL غير مُعد. راجع docs/SUPABASE_SETUP.md" }
  }

  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const phone = String(formData.get("phone") ?? "").trim() || null
  const accountKind = String(formData.get("accountKind") ?? "individual").trim()
  const officeName = String(formData.get("officeName") ?? "").trim()
  const agencyNote = String(formData.get("agencyNote") ?? "").trim() || null
  const socialRaw = String(formData.get("agencySocialUrl") ?? "").trim()
  const logoFile = formData.get("agencyLogo")
  const agencyCitySlug = String(formData.get("agencyCitySlug") ?? "").trim()
  const agencyDistrictSlug = String(formData.get("agencyDistrictSlug") ?? "").trim()
  const agencyNeighborhoodSlug = String(
    formData.get("agencyNeighborhoodSlug") ?? ""
  ).trim()
  const agencyAddressLine = String(formData.get("agencyAddressLine") ?? "").trim()
  const agencyBio = String(formData.get("agencyBio") ?? "").trim() || null

  if (!name || !email || password.length < 6) {
    return { error: "تحقق من الاسم والبريد وكلمة المرور (6 أحرف على الأقل)." }
  }

  const asAgency = accountKind === "agency"
  if (asAgency && officeName.length < 2) {
    return { error: "أدخل اسم المكتب العقاري للتسجيل كوكالة تجارية." }
  }
  if (
    asAgency &&
    (!agencyCitySlug ||
      !agencyDistrictSlug ||
      !agencyNeighborhoodSlug ||
      agencyAddressLine.length < 3)
  ) {
    return { error: "أدخل موقع المكتب الكامل (مدينة وقضاء وحي) وعنوان المكتب." }
  }

  let agencySocialUrl: string | null = null
  if (asAgency && socialRaw) {
    agencySocialUrl = normalizeAgencySocialUrl(socialRaw)
    if (!agencySocialUrl) {
      return { error: "رابط التواصل الاجتماعي غير صالح." }
    }
  }

  if (asAgency && (!(logoFile instanceof File) || logoFile.size === 0)) {
    return { error: "ارفع شعار المكتب — مطلوب للتسجيل كوكالة." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: "تعذر إنشاء الحساب." }

  let agencyLogoUrl: string | null = null
  if (asAgency && logoFile instanceof File) {
    const uploaded = await uploadAgencyLogoFile(data.user.id, logoFile, {
      preferServiceRole: true,
    })
    if ("error" in uploaded) return { error: uploaded.error }
    agencyLogoUrl = uploaded.url
  }

  await ensureUserProfile({
    id: data.user.id,
    email,
    name,
    phone,
    ...(asAgency
      ? {
          agencyAtSignup: {
            officeName,
            note: agencyNote,
            logoUrl: agencyLogoUrl,
            socialUrl: agencySocialUrl,
            citySlug: agencyCitySlug,
            districtSlug: agencyDistrictSlug,
            neighborhoodSlug: agencyNeighborhoodSlug,
            addressLine: agencyAddressLine,
            bio: agencyBio,
          },
        }
      : {}),
  })

  revalidatePath("/admin/users")
  redirect(
    asAgency
      ? "/dashboard/settings?agency=pending"
      : "/dashboard"
  )
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase غير مُعد. راجع docs/SUPABASE_SETUP.md" }
  }

  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/dashboard")

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  if (data.user && isDatabaseConfigured()) {
    await ensureUserProfile({
      id: data.user.id,
      email: data.user.email ?? email,
      name:
        (data.user.user_metadata?.name as string | undefined) ||
        email.split("@")[0],
      phone: (data.user.user_metadata?.phone as string | undefined) ?? null,
    })
  }

  redirect(next.startsWith("/") ? next : "/dashboard")
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  revalidatePath("/", "layout")
  redirect("/")
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase غير مُعد. راجع docs/SUPABASE_SETUP.md" }
  }

  const email = String(formData.get("email") ?? "").trim()
  if (!email) return { error: "أدخل البريد الإلكتروني." }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login`,
  })

  if (error) return { error: error.message }
  return { success: "إن وُجد الحساب، ستصلك رسالة لإعادة تعيين كلمة المرور." }
}
