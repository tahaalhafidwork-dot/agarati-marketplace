import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { PropertyRequestForm } from "@/components/property-requests/property-request-form"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { toPropertyRequestCard } from "@/lib/property-requests"

export const metadata: Metadata = {
  title: "تعديل طلب عقار",
}

export default async function EditPropertyRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) {
    redirect(`/login?next=/dashboard/property-requests/${id}/edit`)
  }
  if (!isDatabaseConfigured()) notFound()

  const row = await prisma.propertyRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { messages: true } },
    },
  })
  if (!row) notFound()
  if (row.userId !== user.id && user.role !== "ADMIN") notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={
          user.role === "ADMIN"
            ? "/admin/property-requests"
            : `/dashboard/property-requests/${id}`
        }
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-3.5" />
        {user.role === "ADMIN" ? "رجوع لمراجعة الطلبات" : "رجوع للطلب"}
      </Link>
      <div>
        <h1 className="text-xl font-semibold">تعديل طلب العقار</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.role === "ADMIN"
            ? "عدّل مواصفات الطلب من لوحة الإدارة ثم احفظ."
            : "حدّث المواصفات أو أغلق الطلب بعد التلبية."}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <PropertyRequestForm
          mode="edit"
          initialValues={toPropertyRequestCard(row)}
        />
      </div>
    </div>
  )
}
