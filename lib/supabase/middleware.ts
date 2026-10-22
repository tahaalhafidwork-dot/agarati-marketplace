import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const AUTH_TIMEOUT_MS = 2_000

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith("sb-") &&
        (c.name.includes("auth-token") || c.name.includes("access-token"))
    )
}

async function getUserWithTimeout(
  getUser: () => Promise<{ data: { user: unknown }; error: unknown }>
) {
  return Promise.race([
    getUser(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AUTH_TIMEOUT")), AUTH_TIMEOUT_MS)
    }),
  ])
}

/**
 * Refresh Supabase session cookies when needed.
 * Callers should skip this entirely on public routes without auth cookies —
 * a dead Supabase project otherwise stalls every navigation for tens of seconds.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return { response: NextResponse.next({ request }), user: null }
  }

  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const {
      data: { user },
    } = await getUserWithTimeout(() => supabase.auth.getUser())
    return { response: supabaseResponse, user }
  } catch {
    // Unreachable Supabase / network — never block the page for retries.
    return { response: supabaseResponse, user: null }
  }
}

export { hasSupabaseAuthCookie }
