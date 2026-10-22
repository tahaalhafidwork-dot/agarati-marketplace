export type AccountIdentityKind =
  | "INDIVIDUAL"
  | "AGENT"
  | "AGENCY"

export const ACCOUNT_IDENTITY_LABELS: Record<AccountIdentityKind, string> = {
  INDIVIDUAL: "حساب فردي",
  AGENT: "وكيل",
  AGENCY: "وكالة تجارية",
}

/**
 * UserRole is platform access, AccountType is the commercial account kind,
 * and AgencyMemberRole is the user's job inside an agency. Keep them separate.
 */
export function resolveAccountIdentity(input: {
  accountType: "INDIVIDUAL" | "AGENCY"
  agencyMembershipRole?: "OWNER" | "AGENT" | null
}): AccountIdentityKind {
  if (input.agencyMembershipRole === "AGENT") return "AGENT"
  if (
    input.accountType === "AGENCY" ||
    input.agencyMembershipRole === "OWNER"
  ) {
    return "AGENCY"
  }
  return "INDIVIDUAL"
}
