"use client"

import { useActionState, useState, type ReactNode } from "react"
import {
  Check,
  Copy,
  KeyRound,
  Pencil,
  X,
} from "lucide-react"

import {
  updateAdminUserCredentialsAction,
  type AdminAccountKind,
  type AdminUserActionState,
} from "@/lib/actions/admin-users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type AdminUserCredentials = {
  id: string
  name: string
  email: string
  phone: string | null
  role: "SEEKER" | "LISTER" | "ADMIN"
  accountType: "INDIVIDUAL" | "AGENCY"
  agencyUpgradeStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED"
}

function accountKindFromUser(user: AdminUserCredentials): AdminAccountKind {
  if (
    user.accountType === "AGENCY" ||
    user.agencyUpgradeStatus === "APPROVED"
  ) {
    return "AGENCY"
  }
  return user.role
}

function accountKindLabel(kind: AdminAccountKind): string {
  switch (kind) {
    case "ADMIN":
      return "مشرف"
    case "SEEKER":
      return "باحث"
    case "AGENCY":
      return "وكيل تجاري"
    default:
      return "معلن"
  }
}

const initial: AdminUserActionState = {}

export function AdminUserCredentialsPanel({
  user,
}: {
  user: AdminUserCredentials
}) {
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState<"email" | null>(null)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone ?? "")
  const [password, setPassword] = useState("")
  const [kind, setKind] = useState<AdminAccountKind>(() =>
    accountKindFromUser(user)
  )
  const [state, action, pending] = useActionState(
    updateAdminUserCredentialsAction,
    initial
  )
  const [successSeen, setSuccessSeen] = useState(state.success)

  if (state.success !== successSeen) {
    setSuccessSeen(state.success)
    if (state.success) setEditing(false)
  }

  const startEdit = () => {
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone ?? "")
    setPassword("")
    setKind(accountKindFromUser(user))
    setEditing(true)
  }

  const copy = async (kindCopy: "email", value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kindCopy)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      /* ignore */
    }
  }

  if (editing) {
    return (
      <form
        action={action}
        className="space-y-3 rounded-lg border border-[color:var(--brand-gold)]/30 bg-[#fffdf9] p-3"
      >
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="role" value={kind} />

        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F2744]">
            <KeyRound className="size-3.5 text-[color:var(--brand-gold)]" />
            تعديل بيانات الدخول
          </p>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex size-7 items-center justify-center rounded-full bg-[#0F2744]/8 text-[#0F2744]/70 hover:bg-[#0F2744]/12"
            aria-label="إلغاء"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={`name-${user.id}`} className="text-xs">
              الاسم
            </Label>
            <Input
              id={`name-${user.id}`}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`phone-${user.id}`} className="text-xs">
              الهاتف
            </Label>
            <Input
              id={`phone-${user.id}`}
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="h-9"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`email-${user.id}`} className="text-xs">
              البريد (رمز الدخول)
            </Label>
            <Input
              id={`email-${user.id}`}
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`password-${user.id}`} className="text-xs">
              كلمة مرور جديدة (اختياري — عبر Supabase Auth)
            </Label>
            <Input
              id={`password-${user.id}`}
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="اتركها فارغة للإبقاء على الحالية"
              dir="ltr"
              className="h-9 font-mono text-sm"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">الدور</Label>
            <Select
              value={kind}
              onValueChange={(v) =>
                setKind((v as AdminAccountKind) || "LISTER")
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
                {accountKindLabel(kind)}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LISTER">معلن</SelectItem>
                <SelectItem value="SEEKER">باحث</SelectItem>
                <SelectItem value="AGENCY">وكيل تجاري</SelectItem>
                <SelectItem value="ADMIN">مشرف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {state.error ? (
          <p className="text-xs font-medium text-destructive">{state.error}</p>
        ) : null}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setEditing(false)}
            disabled={pending}
          >
            إلغاء
          </Button>
          <Button type="submit" size="sm" className="flex-1" disabled={pending}>
            {pending ? "جاري الحفظ…" : "حفظ"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="rounded-lg border border-border/80 bg-muted/25 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-[#0F2744]">
          <KeyRound className="size-3 text-[color:var(--brand-gold)]" />
          رموز الدخول
        </p>
        <button
          type="button"
          onClick={startEdit}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.65rem] font-medium text-[#0F2744] transition hover:bg-[#0F2744]/8"
        >
          <Pencil className="size-3" />
          تعديل
        </button>
      </div>

      <div className="space-y-1.5 text-[0.72rem]">
        <CredentialRow
          label="البريد"
          value={user.email}
          dir="ltr"
          copied={copied === "email"}
          onCopy={() => copy("email", user.email)}
        />
        <p className="text-[0.65rem] text-muted-foreground">
          كلمة المرور تُدار عبر Supabase Auth فقط — لا تُخزَّن في قاعدة البيانات.
        </p>
      </div>

      {state.success ? (
        <p className="mt-1.5 text-[0.65rem] font-medium text-emerald-700">
          {state.success}
        </p>
      ) : null}
    </div>
  )
}

function CredentialRow({
  label,
  value,
  dir,
  muted,
  mono,
  trailing,
  copied,
  onCopy,
}: {
  label: string
  value: string
  dir?: "ltr" | "rtl"
  muted?: boolean
  mono?: boolean
  trailing?: ReactNode
  copied?: boolean
  onCopy?: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[#6B6560]">{label}</span>
      <span
        dir={dir}
        className={cn(
          "min-w-0 flex-1 truncate",
          muted ? "text-muted-foreground" : "font-medium text-[#0F2744]",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
      {trailing}
      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="نسخ"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      ) : null}
    </div>
  )
}
