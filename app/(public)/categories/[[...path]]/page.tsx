import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  AppSubHeader,
  CategoryRowLink,
} from "@/components/layout/app-sub-header"
import {
  relatedCategories,
  resolveCategoryPath,
} from "@/lib/category-taxonomy"

type Props = {
  params: Promise<{ path?: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  const resolved = await resolveCategoryPath(path ?? [])
  return { title: resolved?.node.label ?? "التصنيفات" }
}

/**
 * Categories is a taxonomy navigator only (type → deal chips).
 * Listing results live on `/properties?...` via each child `href`.
 * Do not list ads under the deal options — that mixed, unfiltered block
 * confused users after opening a main category.
 */
export default async function CategoriesPage({ params }: Props) {
  const { path } = await params
  const segments = path ?? []
  const resolved = await resolveCategoryPath(segments)
  if (!resolved) notFound()

  const { node, parentHref } = resolved
  const children = node.children ?? []

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AppSubHeader title={node.label} backHref={parentHref} />

      <div className="border-b border-border bg-card">
        {children.map((child) => {
          const href =
            child.href ??
            `/categories/${[...segments, child.slug].filter(Boolean).join("/")}`
          return (
            <CategoryRowLink
              key={child.slug + child.label}
              label={child.label}
              count={child.count}
              href={href}
              emphasize={child.slug === "all"}
            />
          )
        })}
      </div>

      {segments.length > 0 ? (
        <div>
          <div className="bg-muted px-4 py-2 text-[0.7rem] font-semibold tracking-wide text-muted-foreground">
            تصنيفات ذات صلة
          </div>
          {relatedCategories.map((item) => (
            <CategoryRowLink
              key={item.label}
              label={item.label}
              href={item.href}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
