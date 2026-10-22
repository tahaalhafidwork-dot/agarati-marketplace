import type { Metadata } from "next"

import { PropertiesBrowseView } from "@/components/browse/properties-browse-view"
import {
  buildPropertiesBrowseMetadata,
  loadPropertiesBrowsePage,
} from "@/application/listings/browse-page"
import { getSessionUser } from "@/lib/auth"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const sp = await searchParams
  const { title, description } = buildPropertiesBrowseMetadata(sp)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ar",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const session = await getSessionUser()
  const model = await loadPropertiesBrowsePage({
    searchParams: sp,
    userId: session?.id ?? null,
  })
  return <PropertiesBrowseView model={model} />
}
