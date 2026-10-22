import { requireSessionUser } from "@/lib/auth"
import { agarlyJson } from "@/lib/agarly/http"
import { getAgarlyQuotaSnapshot } from "@/lib/agarly/quota"

export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await requireSessionUser()
    const quota = await getAgarlyQuotaSnapshot(user.id)
    return agarlyJson({ quota })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return agarlyJson({ error: "سجّل الدخول أولًا.", code: "UNAUTHORIZED" }, { status: 401 })
    }
    return agarlyJson({ error: "تعذر قراءة رصيد البحث.", code: "QUOTA_UNAVAILABLE" }, { status: 503 })
  }
}
