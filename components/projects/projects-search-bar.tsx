"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type ProjectCityOption = { slug: string; label: string }

export function ProjectsSearchBar({
  initialQ,
  initialCity,
  cities,
}: {
  initialQ: string
  initialCity: string
  cities: ProjectCityOption[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const hasFilter = Boolean(initialQ || initialCity)

  function submit(formData: FormData) {
    const q = String(formData.get("q") ?? "").trim()
    const city = String(formData.get("city") ?? "").trim()
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (city) params.set("city", city)
    const href = params.size ? `/projects?${params}` : "/projects"
    startTransition(() => {
      router.push(href)
    })
  }

  function clear() {
    startTransition(() => {
      router.push("/projects")
    })
  }

  return (
    <form action={submit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative shrink-0 sm:w-[9.5rem]">
          <span className="sr-only">المدينة</span>
          <select
            name="city"
            defaultValue={initialCity}
            disabled={pending}
            className={cn(
              "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-[#0F2744]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <option value="">كل المدن</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex min-w-0 flex-1 gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={initialQ}
              placeholder="اسم المشروع…"
              aria-label="البحث باسم المشروع"
              className="h-9 ps-8 text-sm"
              disabled={pending}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-9 shrink-0"
            disabled={pending}
          >
            بحث
          </Button>
          {hasFilter ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 shrink-0 gap-1"
              disabled={pending}
              onClick={clear}
            >
              <X className="size-3.5" />
              مسح
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}
