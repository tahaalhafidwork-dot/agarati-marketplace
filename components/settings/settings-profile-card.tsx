import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { SessionUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`
  }
  return name.slice(0, 1) || "?"
}

const accountLabel: Record<string, string> = {
  INDIVIDUAL: "حساب فردي",
  AGENCY: "وكيل عقاري — تجاري",
}

export function SettingsProfileCard({ user }: { user: SessionUser }) {
  const isAgency =
    user.accountType === "AGENCY" || user.agencyUpgradeStatus === "APPROVED"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm",
        "bg-[linear-gradient(145deg,#fffdf9_0%,#f7f3ec_55%,#fff_100%)]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,149,108,0.55)_20%,rgba(184,149,108,0.55)_80%,transparent)]"
        aria-hidden
      />
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="size-16 ring-2 ring-[color:var(--brand-gold)]/35">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-[#0F2744] text-lg font-semibold text-[color:var(--brand-gold)]">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-lg font-semibold tracking-tight text-[#0F2744]">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {user.email}
          </p>
          <Badge
            className={cn(
              "rounded-md text-[0.65rem]",
              isAgency
                ? "bg-[color:var(--brand-gold)]/20 text-[#0F2744]"
                : "bg-[#0F2744]/8 text-[#0F2744]"
            )}
          >
            {isAgency ? accountLabel.AGENCY : accountLabel.INDIVIDUAL}
          </Badge>
        </div>
      </div>
    </div>
  )
}
