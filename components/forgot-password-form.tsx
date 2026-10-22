"use client"

import { useActionState } from "react"
import Link from "next/link"
import { cn } from "cn"

import { resetPasswordAction, type AuthActionState } from "@/lib/actions/auth"
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

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">استعادة كلمة المرور</CardTitle>
          <CardDescription>
            أدخل بريدك وسنرسل رابط إعادة التعيين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </Field>
              {state.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
              ) : null}
              {state.success ? (
                <p className="text-sm text-primary">{state.success}</p>
              ) : null}
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "جاري الإرسال…" : "إرسال الرابط"}
                </Button>
                <FieldDescription className="text-center">
                  <Link href="/login" className="text-primary hover:underline">
                    العودة لتسجيل الدخول
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
