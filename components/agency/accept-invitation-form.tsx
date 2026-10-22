"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  acceptAgencyInvitationAction,
  acceptAgencyInvitationByIdAction,
  type AgencyActionState,
} from "@/lib/actions/agency"

const initial: AgencyActionState = {}

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    acceptAgencyInvitationAction,
    initial
  )
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      {state.error || state.success ? (
        <p className={state.error ? "text-sm text-red-700" : "text-sm text-emerald-700"}>
          {state.error ?? state.success}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "جارٍ قبول الدعوة…" : "قبول الدعوة والانضمام"}
      </Button>
    </form>
  )
}

export function AcceptInvitationByIdForm({
  invitationId,
}: {
  invitationId: string
}) {
  const [state, action, pending] = useActionState(
    acceptAgencyInvitationByIdAction,
    initial
  )

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="invitationId" value={invitationId} />
      {state.error || state.success ? (
        <p
          role={state.error ? "alert" : "status"}
          aria-live="polite"
          className={state.error ? "text-xs text-red-700" : "text-xs text-emerald-700"}
        >
          {state.error ?? state.success}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending} className="w-full sm:w-auto">
        {pending ? "جارٍ القبول…" : "قبول الدعوة"}
      </Button>
    </form>
  )
}
