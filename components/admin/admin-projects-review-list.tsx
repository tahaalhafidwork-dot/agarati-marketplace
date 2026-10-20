"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { reviewProjectAction } from "@/lib/actions/agency-projects"

type PendingProject = {
  id: string
  name: string
  slug: string
  summary: string | null
  imageUrl: string | null
  createdAt: string
  proposerName: string
  proposerOffice: string | null
}

export function AdminProjectsReviewList({
  projects,
}: {
  projects: PendingProject[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function review(id: string, decision: "APPROVED" | "REJECTED") {
    setBusyId(id)
    setMessage(null)
    startTransition(async () => {
      const result = await reviewProjectAction(id, decision)
      setBusyId(null)
      setMessage(result.error ?? result.success ?? null)
      if (!result.error) router.refresh()
    })
  }

  if (projects.length === 0) {
    return (
      <p className="rounded-lg border border-border px-4 py-10 text-center text-sm text-muted-foreground">
        لا اقتراحات مشاريع معلّقة حالياً.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {projects.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[0.65rem] text-muted-foreground">
                  بلا صورة
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-[#0F2744]">{p.name}</p>
              <p className="text-[0.7rem] text-muted-foreground" dir="ltr">
                {p.slug}
              </p>
              <p className="text-xs text-muted-foreground">
                اقترحه: {p.proposerOffice || p.proposerName}
              </p>
              {p.summary ? (
                <p className="text-xs leading-5 text-[#0F2744]/85">{p.summary}</p>
              ) : null}
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
