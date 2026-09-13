import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        لم نعثر على هذه الصفحة. عد إلى الرئيسية أو تصفح العقارات.
      </p>
      <Link href="/" className={`${buttonVariants()} mt-6`}>
        الرئيسية
      </Link>
    </div>
  )
}
