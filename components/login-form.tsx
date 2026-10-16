"use client"

import { useActionState } from "react"
import Link from "next/link"
import { cn } from "cn"

import { signInAction, type AuthActionState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initial: AuthActionState = {}

export function LoginForm({
  className,
  nextPath = "/dashboard",
  ...props
}: React.ComponentProps<"div"> & { nextPath?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">مرحباً بعودتك</CardTitle>
          <CardDescription>دخول بحساب أغاراتي</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <input type="hidden" name="next" value={nextPath} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ms-auto text-sm text-primary underline-offset-4 hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </Field>
              {state.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
              ) : null}
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "جاري الدخول…" : "دخول"}
                </Button>
                <FieldDescription className="text-center">
                  ليس لديك حساب؟{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    إنشاء حساب
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
