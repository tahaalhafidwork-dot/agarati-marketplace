import { NextResponse, type NextRequest } from "next/server"

import {
  hasSupabaseAuthCookie,
  updateSession,
} from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const needsAuth =
    path.startsWith("/dashboard") || path.startsWith("/admin")

  // Public browse: skip Supabase entirely when there is no session cookie.
  // Otherwise getUser() retries against a dead Auth host and freezes TTFB (~20–50s).
  if (!needsAuth && !hasSupabaseAuthCookie(request)) {
    return NextResponse.next()
  }

  const { response, user } = await updateSession(request)

  if (!needsAuth) return response

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    // UI preview without env — allow
    return response
  }

  if (!user) {
    const login = new URL("/login", request.url)
    login.searchParams.set("next", path)
    return NextResponse.redirect(login)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
