import { redirect } from "next/navigation"

/** Legacy Arabic name — permanently renamed to Agarly. */
export default function BasiraRedirectPage() {
  redirect("/agarly")
}
