"use client"

import { useActionState, useRef, useState } from "react"
import { Camera, ImagePlus, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  contributeProjectPhotoAction,
  type ProjectPhotoActionState,
} from "@/lib/actions/project-photos"
import { PROJECT_GALLERY_MAX } from "@/lib/project-gallery"
import { cn } from "@/lib/utils"

const initial: ProjectPhotoActionState = {}

export function ProjectPhotoContributeForm({
  projectId,
  approvedCount,
  isSignedIn,
}: {
  projectId: string
  approvedCount: number
  isSignedIn: boolean
}) {
  const [state, formAction, pending] = useActionState(
    contributeProjectPhotoAction,
    initial
  )
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileLabel, setFileLabel] = useState<string | null>(null)

  const full = approvedCount >= PROJECT_GALLERY_MAX
  const remaining = PROJECT_GALLERY_MAX - approvedCount

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-3 py-2.5">
        <p className="text-xs leading-5 text-muted-foreground">
          شارك صورة من المشروع باسمك بعد موافقة الإدارة.
        </p>
        <Link
          href="/login"
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          تسجيل الدخول
        </Link>
      </div>
    )
  }

  if (full) {
    return (
      <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        المعرض مكتمل ({PROJECT_GALLERY_MAX} صورة).
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input
        ref={fileRef}
        type="file"
        name="photo"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          setFileLabel(f ? f.name : null)
        }}
      />

      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5",
          fileLabel && "border-[color:var(--brand-gold)]/40"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="size-3.5 text-[color:var(--brand-gold)]" />
          {fileLabel ? "تغيير" : "اختيار صورة"}
        </Button>

        <p className="min-w-0 flex-1 truncate text-[0.65rem] text-muted-foreground">
          {fileLabel ?? `متبقي ${remaining} · بعد موافقة الإدارة`}
        </p>

        <Button
          type="submit"
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-2.5"
          disabled={pending || !fileLabel}
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Camera className="size-3.5" />
          )}
          {pending ? "…" : "إرسال"}
        </Button>
      </div>

      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-muted-foreground">{state.success}</p>
      ) : null}
    </form>
  )
}
