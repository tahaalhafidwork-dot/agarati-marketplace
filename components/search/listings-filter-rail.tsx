"use client"

import { RotateCcw, Search } from "lucide-react"

import {
  draftFromQuery,
  draftToQueryPatch,
  emptyFilterDraft,
  ListingsFilterFields,
  type ListingsFilterDraft,
} from "@/components/search/listings-filter-fields"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { buildPropertiesHref, type ListingQuery } from "@/lib/listing-query"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ListingsFilterRail({
  query,
  view = "list",
  className,
  catalogProjects,
}: {
  query: ListingQuery
  view?: "list" | "map"
  className?: string
  catalogProjects?: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<ListingsFilterDraft>(() =>
    draftFromQuery(query)
  )

  const apply = () => {
    router.push(
      buildPropertiesHref({
        ...query,
        ...draftToQueryPatch(draft),
        view,
      })
    )
  }

  const reset = () => {
    const cleared = emptyFilterDraft()
    setDraft(cleared)
    router.push(
      buildPropertiesHref({
        category: query.category,
        sort: query.sort,
        view,
      })
    )
  }

  return (
    <Card
      size="sm"
      className={cn(
        "sticky top-20 gap-0 overflow-hidden border-border/80 py-0 shadow-sm",
        className
      )}
    >
      <CardHeader className="border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <CardTitle className="text-sm text-primary-foreground">
          تصفية النتائج
        </CardTitle>
        <CardDescription className="text-[0.7rem] text-primary-foreground/75">
          مدينة · قضاء · حي · مجمع
        </CardDescription>
      </CardHeader>

      <ScrollArea className="h-[min(68vh,36rem)]">
        <CardContent className="px-4 py-4">
          <ListingsFilterFields
            value={draft}
            onChange={setDraft}
            category={query.category}
            catalogProjects={catalogProjects}
          />
        </CardContent>
      </ScrollArea>

      <CardFooter className="flex flex-col gap-2 border-t border-border bg-muted/30 p-3">
        <Button type="button" className="w-full gap-1.5" onClick={apply}>
          <Search className="size-3.5" />
          تطبيق الفلاتر
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-1.5"
          onClick={reset}
        >
          <RotateCcw className="size-3.5" />
          مسح الكل
        </Button>
      </CardFooter>
    </Card>
  )
}
