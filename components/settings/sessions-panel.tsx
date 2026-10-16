"use client"

import { useState, useTransition } from "react"
import { MonitorSmartphone, ShieldOff } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { revokeOtherSessionsAction } from "@/lib/actions/settings"
import type { SessionUser } from "@/lib/auth"

export function SessionsPanel({
  user,
  lastSignInAt,
}: {
  user: SessionUser
  lastSignInAt?: string | null
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: "ok" | "err"
    text: string
  } | null>(null)

  return (
    <SettingsSection
      title="الجلسات"
      description="جلسة هذا الجهاز نشطة. يمكنك إنهاء الدخول من الأجهزة الأخرى فوراً."
    >
      <div className="flex items-start gap-3 rounded-lg border border-border bg-[#faf6ef]/40 px-3 py-3">
        <MonitorSmartphone className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-gold)]" />
        <div className="min-w-0 text-sm">
          <p className="font-medium text-[#0F2744]">الجلسة الحالية</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
            {user.email}
          </p>
          {lastSignInAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              آخر دخول تقريبي:{" "}
              {new Date(lastSignInAt).toLocaleString("ar-IQ")}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={pending}
        onClick={() => {
          setMessage(null)
          startTransition(async () => {
            const result = await revokeOtherSessionsAction()
            if (result.error) {
              setMessage({ type: "err", text: result.error })
              return
            }
            setMessage({
              type: "ok",
              text: result.success ?? "تم.",
            })
          })
        }}
      >
        <ShieldOff className="size-3.5" />
        {pending ? "جاري الإنهاء…" : "إنهاء الجلسات الأخرى"}
      </Button>

      {message ? (
        <p
          className={
            message.type === "ok"
              ? "text-xs text-emerald-700"
              : "text-xs text-destructive"
          }
        >
          {message.text}
        </p>
      ) : null}
    </SettingsSection>
  )
}
