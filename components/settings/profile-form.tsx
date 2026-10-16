"use client"

import { useActionState, useRef } from "react"
import { Camera, Save } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  updateAvatarAction,
  updateProfileAction,
  type SettingsActionState,
} from "@/lib/actions/settings"
import type { SessionUser } from "@/lib/auth"

const initial: SettingsActionState = {}

function initials(name: string) {
  return name.trim().slice(0, 1) || "?"
}

export function ProfileForm({ user }: { user: SessionUser }) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initial
  )
  const [avatarState, avatarAction, avatarPending] = useActionState(
    updateAvatarAction,
    initial
  )
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <SettingsSection
      title="الملف الشخصي"
      description="الاسم ورقم الهاتف وصورة الحساب الظاهرة في التواصل."
    >
      <form action={avatarAction} className="flex items-center gap-4">
        <Avatar size="lg" className="size-14">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-[#0F2744] text-[color:var(--brand-gold)]">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) e.currentTarget.form?.requestSubmit()
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={avatarPending}
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="size-3.5" />
            {avatarPending ? "جاري الرفع…" : "تغيير الصورة"}
          </Button>
          <p className="text-[0.65rem] text-muted-foreground">
            JPG أو PNG · حتى ٣ ميغابايت
          </p>
          {avatarState.error ? (
            <p className="text-xs text-destructive">{avatarState.error}</p>
          ) : null}
          {avatarState.success ? (
            <p className="text-xs text-emerald-700">{avatarState.success}</p>
          ) : null}
        </div>
      </form>

      <form action={profileAction} className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">الاسم</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={user.name}
            autoComplete="name"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone ?? ""}
            placeholder="07xxxxxxxx"
            dir="ltr"
            className="text-start"
            inputMode="tel"
          />
        </div>
        {profileState.error ? (
          <p className="text-xs text-destructive sm:col-span-2">
            {profileState.error}
          </p>
        ) : null}
        {profileState.success ? (
          <p className="text-xs text-emerald-700 sm:col-span-2">
            {profileState.success}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <Button type="submit" size="sm" className="gap-1.5" disabled={profilePending}>
            <Save className="size-3.5" />
            {profilePending ? "جاري الحفظ…" : "حفظ الملف"}
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
