import { NextResponse } from "next/server"

import { PAGE_SIZE } from "@/lib/constants"
import { parseListingQuery } from "@/lib/listing-query"
import { fetchPublicListings } from "@/lib/listing-service"
import { serializeListingForMobile } from "@/lib/mobile/serialize-listing"

/**
 * Thin mobile adapter — browse/list. Delegates to fetchPublicListings.
 * Query params mirror web `/properties` (type, deal, city, q, sort, …).
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const params: Record<string, string | undefined> = {}
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })

  const query = parseListingQuery(params)
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(
    48,
    Math.max(1, Number(params.pageSize) || PAGE_SIZE)
  )
  const take = page <= 1 ? pageSize : page * pageSize
  const rows = await fetchPublicListings(query, { take })
  const items = page <= 1 ? rows : rows.slice((page - 1) * pageSize)

  return NextResponse.json({
    items: items.map((row) => serializeListingForMobile(row, request)),
    page,
    pageSize,
  })
}
