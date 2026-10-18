import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"

import { ErrorState } from "../components/StateViews"
import { mobileRequest } from "../lib/api"
import {
  createMobileSupabase,
  isMobileSupabaseConfigured,
} from "../lib/supabase"

export type AuthProfile = {
  id: string
  email: string
  name: string
  phone: string | null
}

type AuthContextValue = {
  ready: boolean
  session: Session | null
  user: User | null
  accessToken: string | null
  signedIn: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (input: {
    name: string
    email: string
    password: string
    phone?: string
  }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  ensureProfile: (extra?: {
    name?: string
    phone?: string | null
  }) => Promise<AuthProfile | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const AUTH_BOOTSTRAP_TIMEOUT_MS = 8_000

async function syncProfile(
  token: string,
  extra?: {
    name?: string
    phone?: string | null
  }
): Promise<AuthProfile | null> {
  try {
    return await mobileRequest<AuthProfile>(
      "/api/mobile/v1/auth/ensure-profile",
      {
        method: "POST",
        token,
        body: extra ?? {},
      }
    )
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !isMobileSupabaseConfigured())
  const [session, setSession] = useState<Session | null>(null)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const client = createMobileSupabase()
    if (!client) return

    let active = true
    let bootstrapFinished = false
    let authEventSeen = false

    const timeout = setTimeout(() => {
      failBootstrap("استغرقت استعادة جلسة الدخول وقتًا أطول من المتوقع.")
    }, AUTH_BOOTSTRAP_TIMEOUT_MS)

    function finishBootstrap(next: Session | null) {
      if (!active) return
      bootstrapFinished = true
      clearTimeout(timeout)
      setSession(next)
      setBootstrapError(null)
      setReady(true)
    }

    function failBootstrap(message: string) {
      if (!active || bootstrapFinished) return
      bootstrapFinished = true
      clearTimeout(timeout)
      setBootstrapError(message)
      setReady(true)
    }

    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      authEventSeen = true
      finishBootstrap(next)
    })

    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error
        if (authEventSeen) return
        finishBootstrap(data.session)
      })
      .catch(() => {
        if (authEventSeen) return
        failBootstrap("تعذّر قراءة جلسة الدخول المحفوظة.")
      })

    return () => {
      active = false
      clearTimeout(timeout)
      sub.subscription.unsubscribe()
    }
  }, [bootstrapAttempt])

  const retryBootstrap = useCallback(() => {
    if (!mounted.current) return
    setBootstrapError(null)
    setReady(false)
    setBootstrapAttempt((attempt) => attempt + 1)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const client = createMobileSupabase()
    if (!client) return { error: "Supabase غير مُعد على الجهاز." }
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) return { error: error.message }
    if (data.session?.access_token) {
      await syncProfile(data.session.access_token, {})
    }
    return {}
  }, [])

  const signUp = useCallback(
    async (input: {
      name: string
      email: string
      password: string
      phone?: string
    }) => {
      const client = createMobileSupabase()
      if (!client) return { error: "Supabase غير مُعد على الجهاز." }
      const name = input.name.trim()
      const email = input.email.trim()
      const phone = input.phone?.trim() || undefined
      if (!name || !email || input.password.length < 6) {
        return {
          error: "تحقق من الاسم والبريد وكلمة المرور (6 أحرف على الأقل).",
        }
      }
      const { data, error } = await client.auth.signUp({
        email,
        password: input.password,
        options: { data: { name, phone: phone ?? null } },
      })
      if (error) return { error: error.message }
      if (!data.user) return { error: "تعذر إنشاء الحساب." }
      const token =
        data.session?.access_token ??
        (await client.auth.getSession()).data.session?.access_token
      if (token) {
        await syncProfile(token, {
          name,
          phone: phone ?? null,
        })
      }
      return {}
    },
    []
  )

  const signOut = useCallback(async () => {
    const client = createMobileSupabase()
    if (client) await client.auth.signOut()
    if (mounted.current) setSession(null)
  }, [])

  const ensureProfile = useCallback(
    async (extra?: {
      name?: string
      phone?: string | null
    }) => {
      const token = session?.access_token
      if (!token) return null
      return syncProfile(token, extra)
    },
    [session?.access_token]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      signedIn: Boolean(session?.access_token),
      signIn,
      signUp,
      signOut,
      ensureProfile,
    }),
    [ready, session, signIn, signUp, signOut, ensureProfile]
  )

  return (
    <AuthContext.Provider value={value}>
      {bootstrapError ? (
        <ErrorState message={bootstrapError} onRetry={retryBootstrap} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
