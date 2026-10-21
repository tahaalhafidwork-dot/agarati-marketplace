import { NextResponse } from "next/server"

export const AGARLY_MAX_BODY_BYTES = 8 * 1024

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

export function requestBodyTooLarge(request: Request): boolean {
  const raw = request.headers.get("content-length")
  if (!raw) return false
  const size = Number(raw)
  return Number.isFinite(size) && size > AGARLY_MAX_BODY_BYTES
}
