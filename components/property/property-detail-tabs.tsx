"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApproximateAreaMapLazy } from "@/components/map/approximate-area-map-lazy"
import type { ApproximateMapPoint } from "@/lib/map-geo"
import { cn } from "@/lib/utils"

type Attribute = { label: string; value: string }

/** Detail tabs — active tab filled (sahibinden yellow → AGARATİ primary). */
export function PropertyDetailTabs({
  attributes,
  description,
  areaLabel,
  mapPoint,
}: {
  attributes: Attribute[]
  description: string
  areaLabel: string
  mapPoint?: ApproximateMapPoint | null
}) {
  const [tab, setTab] = useState("info")

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="gap-0 overflow-hidden bg-card"
    >
      <TabsList className="h-auto w-full justify-stretch gap-0 rounded-none border-b-2 border-primary bg-transparent p-0">
        <TabsTrigger
          value="info"
          className="flex-1 rounded-none border-0 py-2.5 text-xs data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
        >
          معلومات الإعلان
        </TabsTrigger>
        <TabsTrigger
          value="desc"
          className="flex-1 rounded-none border-0 py-2.5 text-xs data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
        >
          الوصف
        </TabsTrigger>
        <TabsTrigger
          value="area"
          className="flex-1 rounded-none border-0 py-2.5 text-xs data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
        >
          الموقع
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="mt-0">
        <dl>
          {attributes.map((row) => (
            <div
              key={row.label}
              className={cn(
                "flex gap-3 border-b border-border px-3 py-2.5 text-sm",
                row.label === "الخدمات"
                  ? "flex-col items-stretch sm:flex-row sm:items-start sm:justify-between"
                  : "items-center justify-between"
              )}
            >
              <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  "font-medium",
                  row.label === "الخدمات"
                    ? "text-start sm:text-end"
                    : "text-end",
                  row.label === "السعر" &&
                    "font-bold text-[color:var(--brand-gold)]",
                  row.label === "رقم الإعلان" && "font-mono tabular-nums"
                )}
                dir={row.label === "رقم الإعلان" ? "ltr" : undefined}
              >
                {row.label === "الخدمات" && row.value !== "—" ? (
                  <ul className="flex flex-wrap justify-start gap-1.5 sm:justify-end">
                    {row.value.split(" · ").map((service) => (
                      <li
                        key={service}
                        className="rounded-md border border-border bg-[#faf6ef] px-2 py-0.5 text-[0.7rem] font-medium text-primary"
                      >
                        {service}
                      </li>
                    ))}
                  </ul>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </TabsContent>

      <TabsContent
        value="desc"
        className="mt-0 px-3 py-4 text-sm leading-6 text-muted-foreground"
      >
        {description}
      </TabsContent>

      <TabsContent value="area" className="mt-0 space-y-3 px-3 py-4">
        <p className="text-sm text-muted-foreground">
          {areaLabel}
        </p>
        {tab === "area" && mapPoint ? (
          <ApproximateAreaMapLazy point={mapPoint} />
        ) : tab === "area" ? (
          <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
            لا تتوفر خريطة تقريبية لهذه المنطقة بعد
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
