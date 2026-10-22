/** AGARATİ tokens — locked to web mobile SoT (~390px) / docs/UI_SYSTEM.md + globals. */
export const colors = {
  primary: "#0F2744",
  gold: "#B8956C",
  muted: "#6B6560",
  canvas: "#F6F3EE",
  surface: "#FFFCF8",
  headerText: "#f8f1e6",
  border: "#e4ddd2",
  danger: "#b42318",
  success: "#1f6b4a",
  /** Listing result row mobile bg */
  rowBg: "#faf6ef",
  rowBgHover: "#f3ebe0",
  breadcrumbBg: "#eee8df",
  adSlotBg: "rgba(107,101,96,0.08)",
  navBg: "rgba(255,253,249,0.97)",
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 24,
} as const

/** Web --radius: 0.375rem ≈ 6px */
export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  full: 999,
} as const

/** Cairo scale matching web utility classes on ~390px. */
export const type = {
  xs: 10.4, // 0.65rem
  sm: 12, // text-xs
  base: 14, // text-sm
  md: 15.2, // 0.95rem
  lg: 16, // text-base
  xl: 18,
} as const

export const layout = {
  headerHeight: 48, // h-12
  bottomNavHeight: 57.6, // 3.6rem
  fabSize: 48, // size-12
  categoryIcon: 52, // 3.25rem
  listingThumb: 88,
  searchInputH: 44, // h-11
} as const
