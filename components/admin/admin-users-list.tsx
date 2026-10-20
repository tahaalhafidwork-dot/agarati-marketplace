"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Building2,
  CalendarDays,
  Heart,
  Mail,
  Phone,
  Search,
  Shield,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import Link from "next/link"

import { AdminUserCredentialsPanel } from "@/components/admin/admin-user-credentials"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { deleteAdminUserAction } from "@/lib/actions/admin-users"
import { reviewAgencyUpgradeAction } from "@/lib/actions/settings"
import {
  ACCOUNT_IDENTITY_LABELS,
  resolveAccountIdentity,
  type AccountIdentityKind,
} from "@/lib/account-identity"
import { advertiserHref, userAdvertiserSlug } from "@/lib/demo-advertisers"
import { cn } from "@/lib/utils"

export type AdminUserListItem = {
  id: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  role: "SEEKER" | "LISTER" | "ADMIN"
  createdAt: string
  listingsCount: number
  favoritesCount: number
  accountType: "INDIVIDUAL" | "AGENCY"
  agencyUpgradeStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED"
  agencyOfficeName: string | null
  agencyLogoUrl: string | null
  agencySocialUrl: string | null
  agencyAddressLine: string | null
  agencyCitySlug: string | null
  agencyDistrictSlug: string | null
  agencyNeighborhoodSlug: string | null
  agencyRequestNote: string | null
  agencyMembership: {
    role: "OWNER" | "AGENT"
    agency: { name: string; slug: string }
  } | null
}

const identityMeta: Record<
  ReturnType<typeof resolveAccountIdentity>,
  { label: string; icon: typeof Shield; className: string }
> = {
  AGENCY: {
    label: ACCOUNT_IDENTITY_LABELS.AGENCY,
    icon: Building2,
    className: "bg-[color:var(--brand-gold)]/15 text-[#0F2744]",
  },
  AGENT: {
    label: ACCOUNT_IDENTITY_LABELS.AGENT,
    icon: UserRound,
    className: "bg-sky-100 text-sky-900",
  },
  INDIVIDUAL: {
    label: ACCOUNT_IDENTITY_LABELS.INDIVIDUAL,
    icon: UserRound,
    className: "bg-muted text-muted-foreground",
  },
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}

function matchesQuery(u: AdminUserListItem, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const identity = resolveAccountIdentity({
    accountType: u.accountType,
    agencyMembershipRole: u.agencyMembership?.role,
  })
  const hay = [
    u.name,
    u.email,
    u.phone ?? "",
    u.whatsapp ?? "",
    identityMeta[identity].label,
    u.role === "ADMIN" ? "مدير النظام" : "مستخدم",
    u.agencyMembership?.agency.name ?? "",
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(needle)
}

type IdentityScope = "ALL" | AccountIdentityKind

function identityKindForUser(user: AdminUserListItem): AccountIdentityKind {
  return resolveAccountIdentity({
    accountType: user.accountType,
    agencyMembershipRole: user.agencyMembership?.role,
  })
}

export function AdminUsersList({
  users,
  currentUserId,
}: {
  users: AdminUserListItem[]
  currentUserId: string
}) {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<"all" | "pending">("all")
  const [identityScope, setIdentityScope] = useState<IdentityScope>("ALL")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [agencyBusyId, setAgencyBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const pendingAgencyCount = useMemo(
    () => users.filter((u) => u.agencyUpgradeStatus === "PENDING").length,
    [users]
  )
  const identityCounts = useMemo(() => {
    const counts: Record<AccountIdentityKind, number> = {
      INDIVIDUAL: 0,
      AGENT: 0,
      AGENCY: 0,
    }
    for (const user of users) counts[identityKindForUser(user)] += 1
    return counts
  }, [users])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (scope === "pending" && u.agencyUpgradeStatus !== "PENDING") {
        return false
      }
      if (
        identityScope !== "ALL" &&
        identityKindForUser(u) !== identityScope
      ) {
        return false
      }
      return matchesQuery(u, query)
    })
  }, [users, query, scope, identityScope])

  const reviewAgency = (
    u: AdminUserListItem,
    decision: "APPROVED" | "REJECTED"
  ) => {
    setError(null)
    setNotice(null)
    setAgencyBusyId(u.id)
    startTransition(async () => {
      const result = await reviewAgencyUpgradeAction(u.id, decision)
      setAgencyBusyId(null)
      if (result.error) {
        setError(result.error)
        return
      }
      setNotice(result.success ?? "تم.")
    })
  }

  const remove = (u: AdminUserListItem) => {
    if (u.id === currentUserId) {
      setError("لا يمكنك حذف حسابك الحالي.")
      return
    }
    const ok = window.confirm(
      `حذف المستخدم «${u.name}» نهائياً؟\nسيُحذف الحساب وإعلاناته وبياناته المرتبطة.`
    )
    if (!ok) return

    setError(null)
    setPendingId(u.id)
    startTransition(async () => {
      const result = await deleteAdminUserAction(u.id)
      setPendingId(null)
      if (result.error) {
        setError(result.error)
        return
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setScope("all")}
          className={cn(
            "rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm",
            scope === "all"
              ? "bg-[#0F2744] text-[#f8f1e6]"
              : "text-muted-foreground hover:bg-muted/60"
          )}
        >
          كل المستخدمين ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setScope("pending")}
          className={cn(
            "rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm",
            scope === "pending"
              ? "bg-[#0F2744] text-[#f8f1e6]"
              : "text-muted-foreground hover:bg-muted/60"
          )}
        >
          طلبات التحويل إلى وكالة ({pendingAgencyCount})
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-card p-3">
        <p className="text-xs font-medium text-[#0F2744]">تصنيف الحساب</p>
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
          {(
            [
              ["ALL", "كل التصنيفات", users.length],
              ["INDIVIDUAL", "حسابات فردية", identityCounts.INDIVIDUAL],
              ["AGENT", "الوكلاء", identityCounts.AGENT],
              ["AGENCY", "الوكالات التجارية", identityCounts.AGENCY],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              aria-pressed={identityScope === value}
              onClick={() => setIdentityScope(value)}
              className={cn(
                "rounded-lg border px-2.5 py-2 text-xs font-medium transition",
                identityScope === value
                  ? "border-[color:var(--brand-gold)] bg-[color:var(--brand-gold)]/15 text-[#0F2744]"
                  : "border-transparent bg-muted/45 text-muted-foreground hover:bg-muted"
              )}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو البريد أو الهاتف…"
          className="h-10 pe-9 ps-9"
          dir="rtl"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute end-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="مسح البحث"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        {query.trim() || scope === "pending" || identityScope !== "ALL"
          ? `${filtered.length} نتيجة معروضة`
          : `${users.length} حساب مسجّل`}
      </p>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          {notice}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {scope === "pending"
            ? "لا توجد طلبات تحويل إلى وكالة معلّقة حاليًا."
            : query.trim() || identityScope !== "ALL"
              ? "لا نتائج لهذا البحث."
              : "لا مستخدمين بعد."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((u) => {
            const identityKind = identityKindForUser(u)
            const identity = identityMeta[identityKind]
            const IdentityIcon = identity.icon
            const agencyName =
              u.agencyMembership?.agency.name ||
              u.agencyOfficeName?.trim() ||
              null
            const displayName =
              identityKind === "AGENCY" || identityKind === "AGENT"
                ? agencyName || u.name
                : u.name
            const relationshipLine =
              identityKind === "AGENT"
                ? `الوكيل: ${u.name}`
                : identityKind === "AGENCY"
                  ? `صاحب الحساب: ${u.name}`
                  : null
            const initial = (displayName || u.email || "؟").slice(0, 1)
            const profileHref = u.agencyMembership
              ? u.agencyMembership.role === "AGENT"
                ? `/agencies/${encodeURIComponent(u.agencyMembership.agency.slug)}/agents/${encodeURIComponent(u.id)}`
                : `/agencies/${encodeURIComponent(u.agencyMembership.agency.slug)}`
              : advertiserHref(userAdvertiserSlug(u.id))
            const deleting = pending && pendingId === u.id
            const isSelf = u.id === currentUserId
            const fromSignup =
              u.agencyRequestNote?.includes("طلب عند التسجيل") ?? false

            return (
              <li
                key={u.id}
                className={cn(
                  "rounded-xl border bg-card px-3 py-3 shadow-[0_2px_10px_rgba(15,39,68,0.04)]",
                  u.agencyUpgradeStatus === "PENDING"
                    ? "border-[color:var(--brand-gold)]/40"
                    : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-11 ring-1 ring-[color:var(--brand-gold)]/35">
                    <AvatarFallback
                      className={cn(
                        "text-sm font-semibold",
                        u.role === "ADMIN"
                          ? "bg-[#0F2744] text-[color:var(--brand-gold)]"
                          : "bg-[#faf6ef] text-[#0F2744]"
                      )}
                    >
                      {initial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="min-w-0">
                          <Link
                            href={profileHref}
                            className="block truncate text-sm font-semibold text-[#0F2744] hover:underline"
                          >
                            {displayName}
                          </Link>
                          {relationshipLine ? (
                            <span className="mt-0.5 block truncate text-[0.65rem] text-muted-foreground">
                              {relationshipLine}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                            identity.className
                          )}
                        >
                          <IdentityIcon className="size-3" strokeWidth={2} />
                          {identity.label}
                        </span>
                        {u.role === "ADMIN" ? (
                          <Badge className="h-5 gap-1 rounded-md bg-[#0F2744] text-[0.55rem] text-[color:var(--brand-gold)]">
                            <Shield className="size-3" />
                            مدير النظام
                          </Badge>
                        ) : null}
                        {isSelf ? (
                          <Badge
                            variant="outline"
                            className="h-5 text-[0.55rem]"
                          >
                            أنت
                          </Badge>
                        ) : null}
                        {u.agencyUpgradeStatus === "PENDING" ? (
                          <Badge className="h-5 rounded-md bg-amber-100 text-[0.55rem] text-amber-950">
                            طلب وكالة
                          </Badge>
                        ) : null}
                        {u.agencyUpgradeStatus === "PENDING" && fromSignup ? (
                          <Badge
                            variant="outline"
                            className="h-5 text-[0.55rem]"
                          >
                            عند التسجيل
                          </Badge>
                        ) : null}
                      </div>

                      {!isSelf ? (
                        <button
                          type="button"
                          onClick={() => remove(u)}
                          disabled={deleting || pending}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border border-destructive/25 px-2 py-1 text-[0.7rem] font-medium text-destructive transition",
                            "hover:bg-destructive/5 disabled:opacity-50"
                          )}
                        >
                          <Trash2 className="size-3.5" />
                          {deleting ? "جاري الحذف…" : "حذف"}
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-1.5 text-[0.75rem] text-muted-foreground sm:grid-cols-2">
                      <p
                        className="inline-flex min-w-0 items-center gap-1.5"
                        dir="ltr"
                      >
                        <Mail className="size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
                        <span className="truncate">{u.email}</span>
                      </p>
                      <p className="inline-flex items-center gap-1.5" dir="ltr">
                        <Phone className="size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
                        {u.phone || u.whatsapp || "لا رقم"}
                      </p>
                      <p className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
                        {u.listingsCount} إعلان
                      </p>
                      <p className="inline-flex items-center gap-1.5">
                        <Heart className="size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
                        {u.favoritesCount} مفضلة
                      </p>
                      <p className="inline-flex items-center gap-1.5 sm:col-span-2">
                        <CalendarDays className="size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
                        انضمّ {formatDate(u.createdAt)}
                      </p>
                    </div>

                    {u.agencyUpgradeStatus === "PENDING" ? (
                      <div className="rounded-lg border border-[color:var(--brand-gold)]/30 bg-[color:var(--brand-gold)]/10 px-3 py-2.5">
                        <div className="flex gap-3">
                          {u.agencyLogoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.agencyLogoUrl}
                              alt=""
                              className="size-12 shrink-0 rounded-md border border-[color:var(--brand-gold)]/25 object-cover"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#0F2744]">
                              طلب تحويل الحساب إلى وكالة تجارية
                              {u.agencyOfficeName
                                ? ` · ${u.agencyOfficeName}`
                                : ""}
                            </p>
                            <p className="mt-1 text-[0.7rem] text-muted-foreground">
                              المصدر:{" "}
                              {fromSignup
                                ? "اختيار عند التسجيل"
                                : "طلب من الإعدادات"}
                              {u.agencyRequestNote &&
                              !u.agencyRequestNote.includes("طلب عند التسجيل")
                                ? ` — ${u.agencyRequestNote}`
                                : ""}
                            </p>
                            {u.agencyAddressLine || u.agencyCitySlug ? (
                              <p className="mt-1 text-[0.7rem] text-[#0F2744]/80">
                                العنوان:{" "}
                                {[u.agencyAddressLine, u.agencyCitySlug]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            ) : null}
                            {u.agencySocialUrl ? (
                              <a
                                href={u.agencySocialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block truncate text-[0.7rem] text-primary underline-offset-2 hover:underline"
                                dir="ltr"
                              >
                                {u.agencySocialUrl}
                              </a>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={agencyBusyId === u.id || pending}
                            onClick={() => reviewAgency(u, "APPROVED")}
                            className="rounded-md bg-[#0F2744] px-2.5 py-1 text-[0.7rem] font-medium text-[color:var(--brand-gold)] disabled:opacity-50"
                          >
                            قبول
                          </button>
                          <button
                            type="button"
                            disabled={agencyBusyId === u.id || pending}
                            onClick={() => reviewAgency(u, "REJECTED")}
                            className="rounded-md border border-border bg-card px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground disabled:opacity-50"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <AdminUserCredentialsPanel
                      user={{
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        role: u.role,
                        accountType: u.accountType,
                        agencyUpgradeStatus: u.agencyUpgradeStatus,
                        agencyMembership: u.agencyMembership,
                      }}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
