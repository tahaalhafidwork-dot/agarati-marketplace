/**
 * Property requests (wanted ads) — replaces ContactLead inbox in dashboard nav.
 * Create / browse / filter / message / edit / delete.
 */
export const propertyRequestsFeature = {
  name: "property-requests",
  status: "implemented",
  route: "/dashboard/property-requests",
} as const

/** @deprecated Contact leads remain for listing interest forms; inbox moved to property-requests. */
export const contactLeadsFeature = {
  name: "contact-leads",
  status: "legacy-listing-form",
} as const
