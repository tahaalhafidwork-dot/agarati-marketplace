import Link from "next/link"
import { MessageCircle, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { deletePropertyRequestAction } from "@/lib/actions/property-requests"
import {
  requestStatusLabels,
  type PropertyRequestCard,
} from "@/lib/property-requests"
import { cn } from "@/lib/utils"

type Props = {
  items: PropertyRequestCard[]
}

/** Compact owner list — edit / delete without filter chrome. */
export function MyPropertyRequestsList({ items }: Props) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-3 border-b border-border p-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-4"
        >
          <Link
            href={`/dashboard/property-requests/${item.id}`}
            className="min-w-0 flex-1 space-y-1.5 hover:opacity-90"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {item.dealLabel ? (
                <Badge className="rounded-md bg-[#0F2744] text-[0.65rem] text-[#f8f1e6]">
                  {item.dealLabel}
                </Badge>
              ) : null}
              {item.categoryLabel ? (
                <Badge variant="secondary" className="rounded-md text-[0.65rem]">
                  {item.categoryLabel}
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md text-[0.65rem]",
                  item.status === "OPEN" &&
                    "border-emerald-600/30 text-emerald-800",
                  item.status === "PENDING" &&
                    "border-amber-500/40 text-amber-900",
                  item.status === "REJECTED" &&
                    "border-destructive/40 text-destructive"
                )}
              >
                {requestStatusLabels[item.status]}
              </Badge>
              {item.messageCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                  <MessageCircle className="size-3" />
                  {item.messageCount}
                </span>
              ) : null}
            </div>
            <p className="line-clamp-1 text-sm font-semibold text-[#0F2744]">
              {item.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {item.areaLabel} · {item.budgetLabel} ·{" "}
              {item.createdAt.toLocaleDateString("ar-IQ-u-nu-latn")}
            </p>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
            <Link
              href={`/dashboard/property-requests/${item.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-9 gap-1.5 rounded-full px-3"
              )}
            >
              <Pencil className="size-3.5" />
              تعديل
            </Link>
            <form action={deletePropertyRequestAction.bind(null, item.id)}>
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-9 gap-1.5 rounded-full px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                )}
                aria-label={`حذف ${item.title}`}
              >
                <Trash2 className="size-3.5" />
                حذف
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  )
}
