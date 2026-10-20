"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CheckCircle2,
  GitMerge,
  Megaphone,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  moderateListingAction,
  type ComplexModerationDecision,
} from "@/lib/actions/listings"
import { cn } from "@/lib/utils"

type ComplexChoice = Exclude<ComplexModerationDecision, "none">

function outcomeSummary(
  complex: ComplexChoice | null,
  listing: "ACTIVE" | "REJECTED",
  mergeName?: string
): string {
  const listingPart =
    listing === "ACTIVE" ? "نشر الإعلان" : "رفض الإعلان"

  if (!complex) return `سيتم ${listingPart}.`

  if (complex === "approve") {
    return listing === "ACTIVE"
      ? "سيتم اعتماد اسم المجمع ونشر الإعلان مرتبطاً به."
      : "سيتم اعتماد اسم المجمع كمرجع معتمد، مع رفض الإعلان دون ربطه."
  }
  if (complex === "merge") {
    const target = mergeName ? ` «${mergeName}»` : " المختار"
    return listing === "ACTIVE"
      ? `سيتم دمج الاقتراح في المجمع${target} ونشر الإعلان عليه.`
      : `سيتم إسقاط الاقتراح لصالح المجمع${target}، مع رفض الإعلان.`
  }
  // reject complex
  return listing === "ACTIVE"
    ? "سيتم رفض اقتراح المجمع ونشر الإعلان بدونه."
    : "سيتم رفض اقتراح المجمع ورفض الإعلان معاً."
}

export function AdminListingModerateForm({
  listingId,
  listingStatus,
  proposedComplexName,
  complexSlug,
  approvedProjects,
  moderationNote,
  onDone,
}: {
  listingId: string
  listingStatus: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED"
  proposedComplexName: string | null
  complexSlug: string | null
  approvedProjects: { slug: string; name: string }[]
  moderationNote?: string | null
  /** Called after a successful decision (e.g. collapse the panel) */
  onDone?: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [complexName, setComplexName] = useState(proposedComplexName ?? "")
  const [mergeSlug, setMergeSlug] = useState("")
  const [complexChoice, setComplexChoice] = useState<ComplexChoice>("approve")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const hasProposedComplex = Boolean(proposedComplexName?.trim())
  const isRejected = listingStatus === "REJECTED"
  const isPending = listingStatus === "PENDING"

  const mergeTargetName = useMemo(
    () => approvedProjects.find((p) => p.slug === mergeSlug)?.name,
    [approvedProjects, mergeSlug]
  )

  function finish(okMessage: string) {
    setSuccess(okMessage)
    router.refresh()
    onDone?.()
  }

  function submit(listingDecision: "ACTIVE" | "REJECTED") {
    setError(null)
    setSuccess(null)

    if (hasProposedComplex && complexChoice === "merge" && !mergeSlug.trim()) {
      setError("اختر مجمعاً معتمداً للدمج.")
      return
    }
    if (
      hasProposedComplex &&
      complexChoice === "approve" &&
      complexName.trim().length < 2
    ) {
      setError("اسم المجمع قصير جداً.")
      return
    }

    startTransition(async () => {
      try {
        const complexDecision: ComplexModerationDecision = hasProposedComplex
          ? complexChoice
          : "none"

        const defaultNote =
          listingDecision === "REJECTED"
            ? hasProposedComplex && complexChoice === "approve"
              ? "مرفوض من الإدارة — مع اعتماد اسم المجمع كمرجع"
              : "مرفوض من الإدارة"
            : undefined

        await moderateListingAction(listingId, listingDecision, {
          note: note.trim() || defaultNote,
          complexDecision,
          complexName:
            complexDecision === "approve"
              ? complexName.trim() || undefined
              : undefined,
          mergeIntoComplexSlug:
            complexDecision === "merge" ? mergeSlug.trim() : undefined,
        })

        finish(
          outcomeSummary(
            hasProposedComplex ? complexChoice : null,
            listingDecision,
            mergeTargetName
          ).replace("سيتم ", "تم ").replace(".", ".")
        )
      } catch (e) {
        const msg = e instanceof Error ? e.message : "تعذّر تنفيذ القرار"
        setError(
          msg === "MERGE_TARGET_MISSING"
            ? "المجمع المستهدف للدمج غير موجود أو غير معتمد."
            : msg
        )
      }
    })
  }

  const complexOptions: {
    value: ComplexChoice
    label: string
    hint: string
    icon: typeof CheckCircle2
  }[] = [
    {
      value: "approve",
      label: "اعتماد الاسم",
      hint: "إنشاء/اعتماد المجمع بهذا الاسم",
      icon: CheckCircle2,
    },
    {
      value: "merge",
      label: "دمج",
      hint: "ربطه بمجمع معتمد موجود",
      icon: GitMerge,
    },
    {
      value: "reject",
      label: "رفض المجمع",
      hint: "إسقاط الاقتراح دون اعتماد",
      icon: XCircle,
    },
  ]

  return (
    <div className="space-y-3">
      {isRejected && moderationNote ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-[0.7rem] leading-5 text-destructive">
          ملاحظة الرفض السابقة: {moderationNote}
        </p>
      ) : null}

      {hasProposedComplex ? (
        <section className="overflow-hidden rounded-lg border border-[color:var(--brand-gold)]/30 bg-white/80">
          <div className="flex items-start gap-2 border-b border-[color:var(--brand-gold)]/20 bg-[color:var(--brand-gold)]/8 px-2.5 py-2">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-[0.7rem] font-semibold text-[#0F2744]">
                قرار المجمع المقترح
              </p>
              <p className="truncate text-[0.72rem] font-medium text-[#0F2744]">
                «{proposedComplexName}»
              </p>
              <p className="text-[0.62rem] leading-4 text-muted-foreground">
                مستقل عن قرار الإعلان — يمكنك اعتماد المجمع ورفض الإعلان، أو
                العكس.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 p-2.5">
            <div
              className="grid grid-cols-3 gap-1"
              role="radiogroup"
              aria-label="قرار المجمع"
            >
              {complexOptions.map((opt) => {
                const selected = complexChoice === opt.value
                const Icon = opt.icon
                const disabledMerge =
                  opt.value === "merge" && approvedProjects.length === 0
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={pending || disabledMerge}
                    title={disabledMerge ? "لا يوجد مجمع معتمد للدمج" : opt.hint}
                    onClick={() => setComplexChoice(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-md border px-1.5 py-2 text-center transition-colors",
                      selected
                        ? opt.value === "reject"
                          ? "border-destructive/40 bg-destructive/5 text-destructive"
                          : "border-[#0F2744]/35 bg-[#0F2744]/5 text-[#0F2744]"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50",
                      disabledMerge && "opacity-40"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span className="text-[0.62rem] font-semibold leading-tight">
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {complexChoice === "approve" ? (
              <div className="space-y-1">
                <Label className="text-[0.65rem]">الاسم عند الاعتماد</Label>
                <Input
                  value={complexName}
                  onChange={(e) => setComplexName(e.target.value)}
                  className="h-8 text-sm"
                  disabled={pending}
                  placeholder={proposedComplexName ?? "اسم المجمع"}
                />
              </div>
            ) : null}

            {complexChoice === "merge" ? (
              <div className="space-y-1">
                <Label className="text-[0.65rem]">المجمع المعتمد المستهدف</Label>
                <select
                  value={mergeSlug}
                  onChange={(e) => setMergeSlug(e.target.value)}
                  disabled={pending}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">— اختر مجمعاً —</option>
                  {approvedProjects.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {complexChoice === "reject" ? (
              <p className="rounded-md bg-muted/60 px-2 py-1.5 text-[0.62rem] leading-4 text-muted-foreground">
                سيُرفض المجمع معلّق المراجعة إن لم ترتبط به إعلانات أخرى،
                ولن يُربط أي مجمع بالإعلان.
              </p>
            ) : null}

            {complexSlug ? (
              <p className="text-[0.58rem] text-muted-foreground" dir="ltr">
                slug: {complexSlug}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-border bg-white/80">
        <div className="flex items-start gap-2 border-b border-border bg-muted/30 px-2.5 py-2">
          <Megaphone className="mt-0.5 size-3.5 shrink-0 text-[#0F2744]" />
          <div className="min-w-0 space-y-0.5">
            <p className="text-[0.7rem] font-semibold text-[#0F2744]">
              قرار الإعلان
            </p>
            <p className="text-[0.62rem] leading-4 text-muted-foreground">
              {isRejected
                ? "الإعلان مرفوض حالياً — يمكنك إعادة قبوله أو الإبقاء على الرفض بعد معالجة المجمع."
                : "وافق للنشر للعامة، أو ارفض ليعيده المعلن للتعديل."}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 p-2.5">
          <div className="space-y-1">
            <Label className="text-[0.65rem]">ملاحظة للمعلن (اختياري)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-8 text-sm"
              disabled={pending}
              placeholder="مثال: يرجى توضيح السعر أو إضافة صور أوضح"
            />
          </div>

          <p className="rounded-md border border-dashed border-border bg-muted/20 px-2 py-1.5 text-[0.62rem] leading-4 text-muted-foreground">
            عند الموافقة:{" "}
            {outcomeSummary(
              hasProposedComplex ? complexChoice : null,
              "ACTIVE",
              mergeTargetName
            )}
            <br />
            عند الرفض:{" "}
            {outcomeSummary(
              hasProposedComplex ? complexChoice : null,
              "REJECTED",
              mergeTargetName
            )}
          </p>

          {error ? (
            <p className="text-xs font-medium text-destructive">{error}</p>
          ) : null}
          {success ? (
            <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              {success}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1"
              disabled={pending}
              onClick={() => submit("ACTIVE")}
            >
              <CheckCircle2 className="size-3.5" />
              {isRejected ? "إعادة قبول ونشر" : "موافقة ونشر"}
            </Button>
            {isPending || isRejected ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-destructive hover:text-destructive"
                disabled={pending || (isRejected && !hasProposedComplex)}
                onClick={() => submit("REJECTED")}
              >
                <XCircle className="size-3.5" />
                رفض الإعلان
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
