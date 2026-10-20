import { NextResponse } from "next/server"

import { getHomeCategoryRows } from "@/components/home/category-directory"

/**
 * Thin mobile adapter — home category directory rows (same as web getHomeCategoryRows).
 */
export async function GET() {
  const rows = await getHomeCategoryRows()
  return NextResponse.json({
    items: rows.map((r) => ({
      category: r.category,
      label: r.label,
      subtitle: r.subtitle,
      count: r.count,
      href: r.href,
    })),
  })
}
