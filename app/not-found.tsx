import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Search className="size-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground max-w-xs">
        لم نعثر على هذه الصفحة. قد يكون الرابط خاطئاً أو تمت إزالة الصفحة.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link href="/" className={`${buttonVariants()} flex-1 justify-center gap-2`}>
          <ArrowLeft className="size-4" />
          الرئيسية
        </Link>
        <Link href="/properties" className={`${buttonVariants({ variant: "outline" })} flex-1 justify-center gap-2`}>
          <Home className="size-4" />
          تصفح العقارات
        </Link>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        إذا كنت تظن أن هذا خطأ، يرجى{" "}
        <Link href="/contact" className="text-primary hover:underline">
          التواصل معنا
        </Link>
      </p>
    </div>
  )
}
