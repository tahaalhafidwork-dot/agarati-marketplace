import { z } from "zod"

import { requireSessionUser } from "@/lib/auth"
import {
  AgarlyRequestBodyError,
  agarlyJson,
  isSameOriginRequest,
  readAgarlyJsonBody,
} from "@/lib/agarly/http"
import { agarlyFiltersSchema } from "@/lib/agarly/schema"
import { searchAgarly } from "@/lib/agarly/search"

export const runtime = "nodejs"

const bodySchema = z.object({ filters: agarlyFiltersSchema }).strict()

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return agarlyJson({ error: "طلب غير مسموح.", code: "ORIGIN" }, { status: 403 })
  }
  try {
    await requireSessionUser()
  } catch {
    return agarlyJson({ error: "سجّل الدخول أولًا.", code: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const { filters } = bodySchema.parse(await readAgarlyJsonBody(request))
    const results = await searchAgarly(filters)
    return agarlyJson({ filters, results })
  } catch (error) {
    if (error instanceof AgarlyRequestBodyError && error.code === "BODY_TOO_LARGE") {
      return agarlyJson({ error: "حجم الطلب أكبر من المسموح.", code: error.code }, { status: 413 })
    }
    if (error instanceof z.ZodError) {
      return agarlyJson({ error: "مرشحات البحث غير صالحة.", code: "INVALID_FILTERS" }, { status: 400 })
    }
    return agarlyJson({ error: "تعذر تحديث النتائج.", code: "SEARCH_FAILED" }, { status: 503 })
  }
}
