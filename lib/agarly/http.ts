import { NextResponse } from "next/server"

export const AGARLY_MAX_BODY_BYTES = 8 * 1024

export class AgarlyRequestBodyError extends Error {
  constructor(public readonly code: "BODY_TOO_LARGE" | "INVALID_JSON") {
    super(code)
    this.name = "AgarlyRequestBodyError"
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export function agarlyJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("X-Content-Type-Options", "nosniff")
  return response
}

function declaredBodyTooLarge(request: Request): boolean {
  const raw = request.headers.get("content-length")
  if (!raw) return false
  const size = Number(raw)
  return Number.isFinite(size) && size > AGARLY_MAX_BODY_BYTES
}

/** Read the stream with a hard byte ceiling even when Content-Length is absent. */
export async function readAgarlyJsonBody(request: Request): Promise<unknown> {
  if (declaredBodyTooLarge(request)) {
    throw new AgarlyRequestBodyError("BODY_TOO_LARGE")
  }
  if (!request.body) throw new AgarlyRequestBodyError("INVALID_JSON")

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ""
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > AGARLY_MAX_BODY_BYTES) {
        await reader.cancel()
        throw new AgarlyRequestBodyError("BODY_TOO_LARGE")
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
    return JSON.parse(text)
  } catch (error) {
    if (error instanceof AgarlyRequestBodyError) throw error
    throw new AgarlyRequestBodyError("INVALID_JSON")
  }
}
