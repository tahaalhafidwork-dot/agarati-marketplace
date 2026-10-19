export type AgencyPolicyMembership = {
  role: "OWNER" | "AGENT"
  status?: "ACTIVE" | "LEFT"
}

export function mayManageAgencyListing(input: {
  userId: string
  assignedAgentId: string | null
  membership: AgencyPolicyMembership | null
}): boolean {
  return Boolean(
    input.membership &&
      input.membership.status !== "LEFT" &&
      (input.membership.role === "OWNER" ||
        input.assignedAgentId === input.userId)
  )
}

export function invitationAcceptanceError(input: {
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED" | "EXPIRED"
  expiresAt: Date
  invitedEmail: string
  signedInEmail: string
  now: Date
}):
  | "INVITATION_NOT_PENDING"
  | "INVITATION_EXPIRED"
  | "INVITATION_EMAIL_MISMATCH"
  | null {
  if (input.status !== "PENDING") return "INVITATION_NOT_PENDING"
  if (input.expiresAt <= input.now) return "INVITATION_EXPIRED"
  if (
    input.invitedEmail.trim().toLowerCase() !==
    input.signedInEmail.trim().toLowerCase()
  ) {
    return "INVITATION_EMAIL_MISMATCH"
  }
  return null
}

export function nextPersonalBillingKind(
  hasExistingFreeListing: boolean
): "PERSONAL_FREE" | "PERSONAL_PAID" {
  return hasExistingFreeListing ? "PERSONAL_PAID" : "PERSONAL_FREE"
}
