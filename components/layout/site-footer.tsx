import Link from "next/link"

import { Logo } from "@/components/layout/logo"
import {
  footerBrowse,
  footerLegal,
  SITE_NAME_AR,
  SITE_NAME_LATIN,
} from "@/lib/constants"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            سوق عقاري مركّز لتركيا والمنطقة. واجهة عربية، تجربة للجوال أولاً.
          </p>
          <p className="text-xs text-muted-foreground">{SITE_NAME_LATIN}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">تصفح</h2>
          <ul className="space-y-2 text-sm">
            {footerBrowse.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">الحساب</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground"
              >
                دخول
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="text-muted-foreground hover:text-foreground"
              >
                إنشاء حساب
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/favorites"
                className="text-muted-foreground hover:text-foreground"
              >
                المفضلة
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">قانوني</h2>
          <ul className="space-y-2 text-sm">
            {footerLegal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME_AR}. جميع الحقوق محفوظة.
      </div>
    </footer>
  )
}
