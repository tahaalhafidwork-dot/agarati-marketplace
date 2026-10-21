import { z } from "zod"

import { requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, isDatabaseReachable } from "@/lib/db"
import { agarlyJson, isSameOriginRequest, requestBodyTooLarge } from "@/lib/agarly/http"
import { getConfiguredAgarlyProvider, AgarlyProviderError } from "@/lib/agarly/provider"
import { hashSearchPrompt, normalizeSearchPrompt, sanitizePromptForProvider } from "@/lib/agarly/prompt"
import {
  completeAgarlyUsage,
  failAgarlyUsage,
  prismaAgarlyQuotaStore,
  reserveAgarlyRequest,
} from "@/lib/agarly/quota"
import { parseStoredAgarlyFilters } from "@/lib/agarly/schema"
import { searchAgarly } from "@/lib/agarly/search"

export const runtime = "nodejs"

const bodySchema = z
  .object({
    prompt: z.string().trim().min(3).max(500),
    requestId: z.uuid(),
  })
  .strict()

function providerErrorResponse(error: AgarlyProviderError) {
  const status = error.code === "RATE_LIMITED" ? 429 : error.code === "BAD_RESPONSE" ? 502 : 503
  const message =
    error.code === "TIMEOUT"
      ? "استغرق تحليل الطلب وقتًا أطول من المتوقع. حاول مرة أخرى بطلب جديد."
      : error.code === "RATE_LIMITED"
        ? "مزود البحث الذكي مشغول حاليًا. حاول بعد قليل."
        : error.code === "NOT_CONFIGURED"
          ? "البحث الذكي غير مهيأ على الخادم بعد."
          : "تعذر تحليل الطلب الآن. حاول مجددًا بعد قليل."
  return agarlyJson({ error: message, code: error.code }, { status })
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return agarlyJson({ error: "طلب غير مسموح.", code: "ORIGIN" }, { status: 403 })
  }
  if (requestBodyTooLarge(request)) {
    return agarlyJson({ error: "حجم الطلب أكبر من المسموح.", code: "BODY_TOO_LARGE" }, { status: 413 })
  }

  let user
  try {
    user = await requireSessionUser()
  } catch {
    return agarlyJson({ error: "سجّل الدخول لاستخدام Agarly.", code: "UNAUTHORIZED" }, { status: 401 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return agarlyJson({ error: "اكتب وصفًا واضحًا لا يتجاوز 500 حرف.", code: "INVALID_INPUT" }, { status: 400 })
  }

  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) {
    return agarlyJson({ error: "قاعدة البحث غير متاحة مؤقتًا.", code: "DATABASE_UNAVAILABLE" }, { status: 503 })
  }

  let provider
  try {
    provider = getConfiguredAgarlyProvider()
  } catch (error) {
    return providerErrorResponse(
      error instanceof AgarlyProviderError
        ? error
        : new AgarlyProviderError("NOT_CONFIGURED", "Provider is not configured"),
    )
  }

  const prompt = normalizeSearchPrompt(body.prompt)
  let reservation
  try {
    reservation = await reserveAgarlyRequest(prismaAgarlyQuotaStore, {
      requestId: body.requestId,
      userId: user.id,
      promptHash: hashSearchPrompt(prompt),
      provider: provider.name,
      model: provider.model,
    })
  } catch {
    return agarlyJson({ error: "تعذر التحقق من رصيد البحث الآن.", code: "QUOTA_UNAVAILABLE" }, { status: 503 })
  }

  if (reservation.kind === "limited") {
    const retrySeconds = reservation.quota.resetAt
      ? Math.max(1, Math.ceil((Date.parse(reservation.quota.resetAt) - Date.now()) / 1000))
      : 10_800
    const response = agarlyJson(
      {
        error: "استخدمت 10 عمليات بحث ذكية خلال آخر 3 ساعات.",
        code: "QUOTA_EXCEEDED",
        quota: reservation.quota,
      },
      { status: 429 },
    )
    response.headers.set("Retry-After", String(retrySeconds))
    return response
  }

  if (reservation.kind === "duplicate") {
    if (reservation.usage.userId !== user.id) {
      return agarlyJson({ error: "معرّف الطلب مستخدم.", code: "IDEMPOTENCY_CONFLICT" }, { status: 409 })
    }
    if (reservation.usage.status === "COMPLETED" && reservation.usage.filters) {
      try {
        const filters = parseStoredAgarlyFilters(reservation.usage.filters)
        const results = await searchAgarly(filters)
        return agarlyJson({ filters, results, quota: reservation.quota, replayed: true })
      } catch {
        return agarlyJson({ error: "تعذر استعادة نتيجة الطلب السابق.", code: "REPLAY_FAILED" }, { status: 503 })
      }
    }
    return agarlyJson(
      {
        error:
          reservation.usage.status === "PROCESSING"
            ? "هذا الطلب قيد المعالجة بالفعل."
            : "انتهت محاولة هذا الطلب. أعد المحاولة بطلب جديد.",
        code: reservation.usage.status === "PROCESSING" ? "IN_PROGRESS" : "ALREADY_FAILED",
        quota: reservation.quota,
      },
      { status: 409 },
    )
  }

  const timeoutMs = Math.min(20_000, Math.max(4_000, Number(process.env.AI_TIMEOUT_MS) || 12_000))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const filters = await provider.extractFilters(sanitizePromptForProvider(prompt), controller.signal)
    await completeAgarlyUsage(body.requestId, filters)
    const results = await searchAgarly(filters)
    return agarlyJson({ filters, results, quota: reservation.quota, replayed: false })
  } catch (error) {
    const providerError =
      error instanceof AgarlyProviderError
        ? error
        : new AgarlyProviderError("UNAVAILABLE", "Agarly request failed")
    await failAgarlyUsage(body.requestId, providerError.code).catch(() => undefined)
    return providerErrorResponse(providerError)
  } finally {
    clearTimeout(timeout)
  }
}
