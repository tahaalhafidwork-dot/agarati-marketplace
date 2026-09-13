import Link from "next/link"

import { Logo } from "@/components/layout/logo"
import { footerLegal, SITE_NAME_AR } from "@/lib/constants"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            سوق عقاري مركّز لتركيا والمنطقة. واجهة عربية، تجربة للجوال أولاً.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {footerLegal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME_AR}. جميع الحقوق محفوظة.
      </div>
    </footer>
  )
}
