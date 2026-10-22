"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { reviewProjectPhotoAction } from "@/lib/actions/project-photos"
import { listingImagePublicUrl } from "@/lib/supabase/config"

type PendingPhoto = {
  id: string
  storagePath: string
  contributorName: string
  createdAt: string
  projectName: string
  projectSlug: string
}

export function AdminProjectPhotosReviewList({
  photos,
}: {
  photos: PendingPhoto[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function review(id: string, decision: "APPROVED" | "REJECTED") {
    setBusyId(id)
    setMessage(null)
    startTransition(async () => {
      const result = await reviewProjectPhotoAction(id, decision)
      setBusyId(null)
      setMessage(result.error ?? result.success ?? null)
      if (!result.error) router.refresh()
    })
  }

  if (photos.length === 0) {
    return (
      <p className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">
        لا صور مشاريع معلّقة حالياً.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {photos.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start"
          >
            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listingImagePublicUrl(p.storagePath)}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-[#0F2744]">{p.projectName}</p>
              <p className="text-xs text-muted-foreground">
                مساهم: {p.contributorName}
              </p>
              <p className="text-[0.65rem] text-muted-foreground" dir="ltr">
                {new Date(p.createdAt).toLocaleString("ar-IQ-u-nu-latn")}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  disabled={pending && busyId === p.id}
                  onClick={() => review(p.id, "APPROVED")}
                >
                  <Check className="size-3.5" />
                  قبول
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={pending && busyId === p.id}
                  onClick={() => review(p.id, "REJECTED")}
                >
                  <X className="size-3.5" />
                  رفض
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
