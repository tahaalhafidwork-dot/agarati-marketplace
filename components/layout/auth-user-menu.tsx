"use client"

import Link from "next/link"
import { Heart, LayoutDashboard, LogOut, Mail, Settings } from "lucide-react"

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

function initials(name: string) {
  return name.slice(0, 1)
}

export function AuthUserMenu({ user }: { user: AuthUserStub }) {
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
        <DropdownMenuItem render={<Link href="/dashboard/contact-leads" />}>
          <Mail />
          طلبات التواصل
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <Settings />
          الإعدادات
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <LogOut />
          تسجيل الخروج (قريباً)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
