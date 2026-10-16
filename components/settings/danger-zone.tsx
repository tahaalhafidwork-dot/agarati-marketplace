"use client"

import { useActionState, useState, useTransition } from "react"
import { Eraser, Trash2 } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  clearSearchHistoryAction,
  deleteAccountAction,
  type SettingsActionState,
} from "@/lib/actions/settings"
import { clearLocalSearchHistory } from "@/lib/search-history"

const initial: SettingsActionState = {}

export function DangerZone() {
  const [clearMsg, setClearMsg] = useState<string | null>(null)
  const [clearPending, startClear] = useTransition()
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccountAction,
    initial
  )

  return (
    <SettingsSection
      title="الخصوصية والبيانات"
      description="مسح عمليات البحث المحفوظة أو حذف الحساب نهائياً."
      tone="danger"
    >
      <div className="space-y-2 rounded-lg border border-border bg-card px-3 py-3">
        <p className="text-sm font-medium text-[#0F2744]">مسح سجل البحث</p>
        <p className="text-xs leading-5 text-muted-foreground">
          يحذف عمليات البحث المحفوظة في حسابك ويمسح السجل المحلي على هذا الجهاز.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={clearPending}
          onClick={() => {
            setClearMsg(null)
            startClear(async () => {
              clearLocalSearchHistory()
              const result = await clearSearchHistoryAction()
              setClearMsg(result.error ?? result.success ?? null)
            })
          }}
        >
          <Eraser className="size-3.5" />
          {clearPending ? "جاري المسح…" : "مسح سجل البحث"}
        </Button>
        {clearMsg ? (
          <p className="text-xs text-muted-foreground">{clearMsg}</p>
        ) : null}
      </div>

      <form
        action={deleteAction}
        className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/[0.04] px-3 py-3"
      >
        <p className="text-sm font-medium text-destructive">حذف الحساب</p>
        <p className="text-xs leading-5 text-muted-foreground">
          إجراء لا رجعة فيه. سيتم إنهاء الجلسة وحذف بيانات الحساب قدر الإمكان.
          اكتب <span className="font-semibold text-foreground">حذف حسابي</span>{" "}
          للتأكيد.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">عبارة التأكيد</Label>
          <Input
            id="confirm"
            name="confirm"
            placeholder="حذف حسابي"
            autoComplete="off"
          />
        </div>
        {deleteState.error ? (
          <p className="text-xs text-destructive">{deleteState.error}</p>
        ) : null}
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          className="gap-1.5"
          disabled={deletePending}
        >
          <Trash2 className="size-3.5" />
          {deletePending ? "جاري الحذف…" : "حذف الحساب نهائياً"}
        </Button>
      </form>
    </SettingsSection>
  )
}
