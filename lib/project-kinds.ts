import type { ProjectKind } from "@prisma/client"

/** Shown on public residential project directory only */
export const RESIDENTIAL_PROJECT_KINDS: ProjectKind[] = [
  "RESIDENTIAL",
  "MIXED_USE",
]

export function isResidentialProjectKind(kind: ProjectKind): boolean {
  return RESIDENTIAL_PROJECT_KINDS.includes(kind)
}

export function projectKindLabelAr(kind: ProjectKind): string {
  switch (kind) {
    case "RESIDENTIAL":
      return "سكني"
    case "MIXED_USE":
      return "سكني تجاري"
    case "COMMERCIAL":
      return "تجاري"
    default:
      return "مشروع"
  }
}

/** Block mall / shopping-center names from the residential projects directory. */
export function inferCommercialFromName(name: string): boolean {
  const n = name.trim().toLowerCase()
  if (!n) return false
  const patterns = [
    "mall",
    "مول",
    "سيتي سنتر",
    "city center",
    "city-center",
    "مركز تسوق",
    "shopping",
    "hypermarket",
    "هايبر",
  ]
  return patterns.some((p) => n.includes(p.toLowerCase()))
}
