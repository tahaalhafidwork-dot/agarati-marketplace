"use client"

import Link from "next/link"
import { useTransition } from "react"
import { ClipboardList, Heart, LayoutDashboard, LogOut, Settings } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AuthUserStub } from "@/features/auth"
import { signOutAction } from "@/lib/actions/auth"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`
  }
  return name.slice(0, 1) || "?"
}

/** Shared account menu — uses the same `signOutAction` as mobile nav. */
export function AuthUserMenu({ user }: { user: AuthUserStub }) {
  const [pending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="sr-only">قائمة الحساب</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>
          <span className="block text-foreground">{user.name}</span>
          <span className="block font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard />
          لوحة التحكم
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/favorites" />}>
          <Heart />
          المفضلة
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/property-requests" />}>
          <ClipboardList />
          طلبات العقار
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <Settings />
          الإعدادات
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={() => {
            startTransition(() => {
              void signOutAction()
            })
          }}
        >
          <LogOut />
          {pending ? "جاري الخروج…" : "تسجيل الخروج"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
