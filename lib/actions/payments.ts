"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin, requireSessionUser } from "@/lib/auth"
import {
  approvePaymentRequest,
  rejectPaymentRequest,
  requestIndividualListingPayment,
} from "@/lib/payment-service"

export async function requestListingPaymentAction(formData: FormData) {
  const user = await requireSessionUser()
  await requestIndividualListingPayment(
    user.id,
    String(formData.get("listingId") ?? "")
  )
  revalidatePath("/dashboard/properties")
  revalidatePath("/admin/payments")
}

export async function approvePaymentAction(formData: FormData) {
  const admin = await requireAdmin()
  await approvePaymentRequest({
    paymentId: String(formData.get("paymentId") ?? ""),
    adminId: admin.id,
    externalReference:
      String(formData.get("externalReference") ?? "").trim() || null,
  })
  revalidatePath("/admin/payments")
  revalidatePath("/dashboard/properties")
  revalidatePath("/dashboard/agency")
  revalidatePath("/properties")
  revalidatePath("/agencies")
}

export async function rejectPaymentAction(formData: FormData) {
  const admin = await requireAdmin()
  await rejectPaymentRequest({
    paymentId: String(formData.get("paymentId") ?? ""),
    adminId: admin.id,
    reason: String(formData.get("reason") ?? "").trim() || null,
  })
  revalidatePath("/admin/payments")
  revalidatePath("/dashboard/properties")
  revalidatePath("/dashboard/agency")
}
