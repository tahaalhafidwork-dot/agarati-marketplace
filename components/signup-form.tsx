"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Building2, UserRound } from "lucide-react"

import { signUpAction, type AuthActionState } from "@/lib/actions/auth"
import { AgencyLocationFields } from "@/components/agency/agency-location-fields"
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
import { cn } from "@/lib/utils"

const initial: AuthActionState = {}

export function SignupForm({
  className,
  nextPath = "/dashboard",
  ...props
}: React.ComponentProps<"div"> & { nextPath?: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial)
  const [accountKind, setAccountKind] = useState<"individual" | "agency">(
    "individual"
  )

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">إنشاء حساب</CardTitle>
          <CardDescription>
            مجاني — اختر نوع حسابك ثم أكمل البيانات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <input type="hidden" name="accountKind" value={accountKind} />
            <input type="hidden" name="next" value={nextPath} />
            <FieldGroup>
              <Field>
                <FieldLabel>نوع الحساب</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAccountKind("individual")}
                    className={cn(
                      "flex flex-col items-start gap-1.5 rounded-xl border px-3 py-3 text-start transition",
                      accountKind === "individual"
                        ? "border-[#0F2744] bg-[#0F2744]/[0.04] ring-1 ring-[#0F2744]/25"
                        : "border-border bg-card hover:bg-muted/40"
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2744]">
                      <UserRound className="size-4 text-[color:var(--brand-gold)]" />
                      حساب فردي
                    </span>
                    <span className="text-[0.7rem] leading-5 text-muted-foreground">
                      الحساب العادي للأفراد ونشر العقارات الشخصية
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountKind("agency")}
                    className={cn(
                      "flex flex-col items-start gap-1.5 rounded-xl border px-3 py-3 text-start transition",
                      accountKind === "agency"
                        ? "border-[#0F2744] bg-[#0F2744]/[0.04] ring-1 ring-[#0F2744]/25"
                        : "border-border bg-card hover:bg-muted/40"
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2744]">
                      <Building2 className="size-4 text-[color:var(--brand-gold)]" />
                      وكالة تجارية
                    </span>
                    <span className="text-[0.7rem] leading-5 text-muted-foreground">
                      لمكتب عقاري — يُراجع من الإدارة قبل التفعيل
                    </span>
                  </button>
                </div>
              </Field>

              {accountKind === "agency" ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="officeName">اسم المكتب</FieldLabel>
                    <Input
                      id="officeName"
                      name="officeName"
                      type="text"
                      required
                      placeholder="مثال: مكتب النخيل العقاري"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="agencyLogo">
                      شعار المكتب{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="agencyLogo"
                      name="agencyLogo"
                      type="file"
                      accept="image/*"
                      required
                      className="cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                    />
                    <FieldDescription>
                      صورة مربّعة واضحة — حتى 3 ميغابايت
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="agencySocialUrl">
                      رابط تواصل اجتماعي (اختياري)
                    </FieldLabel>
                    <Input
                      id="agencySocialUrl"
                      name="agencySocialUrl"
                      type="url"
                      inputMode="url"
                      placeholder="https://instagram.com/…"
                      dir="ltr"
                      className="text-start"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>موقع المكتب</FieldLabel>
                    <AgencyLocationFields required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="agencyBio">
                      نبذة عامة (اختياري)
                    </FieldLabel>
                    <textarea
                      id="agencyBio"
                      name="agencyBio"
                      rows={2}
                      placeholder="تعريف بالمكتب يظهر في صفحة الوكالة…"
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="agencyNote">
                      ملاحظة للإدارة (اختياري)
                    </FieldLabel>
                    <textarea
                      id="agencyNote"
                      name="agencyNote"
                      rows={2}
                      placeholder="ترخيص المكتب أو أي معلومة للمراجعة…"
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </Field>
                  <p className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-[0.7rem] leading-5 text-amber-950">
                    طلب الوكالة يُرسل للإدارة مباشرة عند التسجيل. يبقى حسابك
                    فردياً حتى الموافقة.
                  </p>
                </>
              ) : null}

              <Field>
                <FieldLabel htmlFor="name">الاسم الكامل</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="أحمد محمد"
                  required
                  autoComplete="name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">الهاتف / واتساب</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="07xxxxxxxxx"
                  autoComplete="tel"
                />
              </Field>
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
                <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </Field>
              {state.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
              ) : null}
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending
                    ? "جاري الإنشاء…"
                    : accountKind === "agency"
                      ? "إنشاء وإرسال طلب الوكالة"
                      : "إنشاء حساب"}
                </Button>
                <FieldDescription className="text-center">
                  لديك حساب؟{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    دخول
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
