"use client"

import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HistoryBackButtonProps = {
  fallbackHref?: string
  className?: string
}

export function HistoryBackButton({
  fallbackHref = "/",
  className,
}: HistoryBackButtonProps) {
  function handleBack() {
    if (window.history.length > 1) {
      window.history.back()
      return
    }

    window.location.replace(fallbackHref)
  }

  return (
    <button
      type="button"
      aria-label="الرجوع إلى الصفحة السابقة"
      onClick={handleBack}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "-ms-2 h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground lg:hidden",
        className
      )}
    >
      <ArrowRight className="size-4" aria-hidden="true" />
      رجوع
    </button>
  )
}
