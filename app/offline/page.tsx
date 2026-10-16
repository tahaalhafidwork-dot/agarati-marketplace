import Link from "next/link"

import { SITE_NAME_AR } from "@/lib/constants"

export const metadata = {
  title: "غير متصل",
  robots: { index: false, follow: false },
}

/** Minimal offline fallback served from the service worker cache. */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-primary">{SITE_NAME_AR}</p>
      <h1 className="text-xl font-semibold tracking-tight">أنت غير متصل</h1>
      <p className="text-sm text-muted-foreground">
        تحقق من الاتصال بالإنترنت ثم أعد المحاولة. الكتالوج الكامل يتطلب شبكة.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        العودة للرئيسية
      </Link>
    </main>
  )
}
