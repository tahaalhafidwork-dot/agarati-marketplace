"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  acceptAgencyInvitationAction,
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
      <Button disabled={pending} className="w-full">
        {pending ? "جارٍ قبول الدعوة…" : "قبول الدعوة والانضمام"}
      </Button>
    </form>
  )
}
