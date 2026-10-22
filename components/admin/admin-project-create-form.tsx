"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminProjectLocationFields } from "@/components/admin/admin-project-location-fields"
import {
  adminCreateProjectAction,
  type AdminProjectActionState,
} from "@/lib/actions/admin-projects"

const initial: AdminProjectActionState = {}

export function AdminProjectCreateForm() {
  const [state, action, pending] = useActionState(
    adminCreateProjectAction,
    initial
  )

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-border bg-card p-3"
    >
      <h3 className="text-sm font-semibold text-[#0F2744]">
        إنشاء مشروع مباشرة
      </h3>
      <p className="text-[0.7rem] text-muted-foreground">
        يُنشر فوراً كموافق عليه (بدون اقتراح وكالة).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="admin-proj-name">الاسم *</Label>
          <Input id="admin-proj-name" name="name" required minLength={2} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="admin-proj-summary">النبذة</Label>
          <textarea
            id="admin-proj-summary"
            name="summary"
            rows={2}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-proj-kind">النوع</Label>
          <select
            id="admin-proj-kind"
            name="projectKind"
            defaultValue="RESIDENTIAL"
            className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            <option value="RESIDENTIAL">سكني</option>
            <option value="MIXED_USE">سكني تجاري</option>
            <option value="COMMERCIAL">تجاري</option>
          </select>
        </div>
        <AdminProjectLocationFields idPrefix="admin-proj" />
        <div className="space-y-1.5">
          <Label htmlFor="admin-proj-image">الغلاف</Label>
          <Input
            id="admin-proj-image"
            name="image"
            type="file"
            accept="image/*"
            className="cursor-pointer file:me-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
          />
        </div>
      </div>
      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-emerald-700">{state.success}</p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "جاري…" : "إنشاء ونشر"}
      </Button>
    </form>
  )
}
