"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { authStub } from "@/features/auth"
import { guestActions, publicNav } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu />
        <span className="sr-only">فتح القائمة</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="sr-only">القائمة</SheetTitle>
          <Logo />
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="flex flex-col gap-2 px-4 pb-4">
          {authStub.isAuthenticated ? (
            <>
              <Link
                href="/dashboard/favorites"
                className={buttonVariants({ variant: "outline" })}
              >
                المفضلة
              </Link>
              <Link
                href="/dashboard/contact-leads"
                className={buttonVariants({ variant: "outline" })}
              >
                طلبات التواصل
              </Link>
            </>
          ) : (
            guestActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={buttonVariants({ variant: item.variant })}
              >
                {item.label}
              </Link>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
