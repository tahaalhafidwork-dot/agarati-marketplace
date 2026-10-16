"use client"

import { useActionState } from "react"
import { KeyRound, Mail, Save } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  updateEmailAction,
  updatePasswordAction,
  type SettingsActionState,
} from "@/lib/actions/settings"
import type { SessionUser } from "@/lib/auth"

const initial: SettingsActionState = {}

export function SecurityForm({ user }: { user: SessionUser }) {
  const [emailState, emailAction, emailPending] = useActionState(
    updateEmailAction,
    initial
  )
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePasswordAction,
    initial
  )

  return (
    <SettingsSection
      title="الأمان"
      description="تغيير البريد الإلكتروني وكلمة المرور لحسابك."
    >
      <form action={emailAction} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="inline-flex items-center gap-1.5">
            <Mail className="size-3.5 text-[color:var(--brand-gold)]" />
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user.email}
            dir="ltr"
            className="text-start"
            autoComplete="email"
          />
        </div>
        {emailState.error ? (
          <p className="text-xs text-destructive">{emailState.error}</p>
        ) : null}
        {emailState.success ? (
          <p className="text-xs text-emerald-700">{emailState.success}</p>
        ) : null}
        <Button type="submit" size="sm" variant="outline" disabled={emailPending}>
          {emailPending ? "جاري التحديث…" : "تحديث البريد"}
        </Button>
      </form>

      <div className="h-px bg-border" />

      <form action={passwordAction} className="space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F2744]">
          <KeyRound className="size-3.5 text-[color:var(--brand-gold)]" />
          كلمة مرور جديدة
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              dir="ltr"
              className="text-start"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              dir="ltr"
              className="text-start"
            />
          </div>
        </div>
        {passwordState.error ? (
          <p className="text-xs text-destructive">{passwordState.error}</p>
        ) : null}
        {passwordState.success ? (
          <p className="text-xs text-emerald-700">{passwordState.success}</p>
        ) : null}
        <Button
          type="submit"
          size="sm"
          className="gap-1.5"
          disabled={passwordPending}
        >
          <Save className="size-3.5" />
          {passwordPending ? "جاري الحفظ…" : "حفظ كلمة المرور"}
        </Button>
      </form>
    </SettingsSection>
  )
}
