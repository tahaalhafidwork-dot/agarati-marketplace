"use client"

import { useActionState, useState } from "react"
import { Bell, MessageCircle } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  updateNotificationPrefsAction,
  type SettingsActionState,
} from "@/lib/actions/settings"
import type { SessionUser } from "@/lib/auth"

const initial: SettingsActionState = {}

export function NotificationToggles({ user }: { user: SessionUser }) {
  const [messages, setMessages] = useState(user.notifyMessages)
  const [other, setOther] = useState(user.notifyOther)
  const [state, action, pending] = useActionState(
    updateNotificationPrefsAction,
    initial
  )

  return (
    <SettingsSection
      title="الإشعارات"
      description="تحكم بما يصلك من تنبيهات الرسائل وإشعارات المنصة. التفضيل يُحفظ الآن؛ التسليم الفعلي يتكامل لاحقاً."
    >
      <form action={action} className="space-y-4">
        <input type="hidden" name="notifyMessages" value={messages ? "on" : ""} />
        <input type="hidden" name="notifyOther" value={other ? "on" : ""} />

        <label className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-[#faf6ef]/40 px-3 py-3">
          <span className="flex min-w-0 items-start gap-2.5">
            <MessageCircle className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-gold)]" />
            <span>
              <span className="block text-sm font-medium text-[#0F2744]">
                إشعارات الرسائل
              </span>
              <span className="block text-xs text-muted-foreground">
                تنبيهات المحادثات وطلبات العقار الجديدة
              </span>
            </span>
          </span>
          <Switch
            checked={messages}
            onCheckedChange={setMessages}
            aria-label="إشعارات الرسائل"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-[#faf6ef]/40 px-3 py-3">
          <span className="flex min-w-0 items-start gap-2.5">
            <Bell className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-gold)]" />
            <span>
              <span className="block text-sm font-medium text-[#0F2744]">
                إشعارات أخرى
              </span>
              <span className="block text-xs text-muted-foreground">
                مراجعة الإعلانات، طلبات الوكالة، وتنبيهات المنصة العامة
              </span>
            </span>
          </span>
          <Switch
            checked={other}
            onCheckedChange={setOther}
            aria-label="إشعارات أخرى"
          />
        </label>

        {state.error ? (
          <p className="text-xs text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-xs text-emerald-700">{state.success}</p>
        ) : null}

        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "جاري الحفظ…" : "حفظ التفضيلات"}
        </Button>
      </form>
    </SettingsSection>
  )
}
