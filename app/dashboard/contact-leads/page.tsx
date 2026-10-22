import { redirect } from "next/navigation"

/** Legacy ContactLead inbox → property requests board. */
export default function ContactLeadsRedirectPage() {
  redirect("/dashboard/property-requests")
}
