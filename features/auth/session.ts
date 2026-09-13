/**
 * Sprint 0 auth stub — not a real session.
 * Flip `isAuthenticated` to preview the header user menu locally.
 * Do not connect Supabase Auth here.
 */
export type AuthUserStub = {
  name: string
  email: string
}

export type AuthStub = {
  isAuthenticated: boolean
  user: AuthUserStub | null
}

export const authStub: AuthStub = {
  isAuthenticated: false,
  user: {
    name: "مستخدم تجريبي",
    email: "demo@agarati.com",
  },
}
