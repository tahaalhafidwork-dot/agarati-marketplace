/**
 * Individual Lucide icons — avoid barrel import (breaks Metro on Windows).
 * Same SVG glyph set as web `lucide-react`.
 */
import type { ComponentType } from "react"

type IconProps = {
  color?: string
  size?: number
  strokeWidth?: number
}

export type LucideIcon = ComponentType<IconProps>

/* eslint-disable @typescript-eslint/no-require-imports */
export const Search = require("lucide-react-native/dist/cjs/icons/search.js")
  .default as LucideIcon
export const X = require("lucide-react-native/dist/cjs/icons/x.js")
  .default as LucideIcon
export const Menu = require("lucide-react-native/dist/cjs/icons/menu.js")
  .default as LucideIcon
export const MessageCircle =
  require("lucide-react-native/dist/cjs/icons/message-circle.js")
    .default as LucideIcon
export const Plus = require("lucide-react-native/dist/cjs/icons/plus.js")
  .default as LucideIcon
export const Sparkles = require("lucide-react-native/dist/cjs/icons/sparkles.js")
  .default as LucideIcon
export const Landmark =
  require("lucide-react-native/dist/cjs/icons/landmark.js").default as LucideIcon
/** Web Building2 → package `building` glyph */
export const Building2 =
  require("lucide-react-native/dist/cjs/icons/building.js").default as LucideIcon
export const UserRound =
  require("lucide-react-native/dist/cjs/icons/user-round.js")
    .default as LucideIcon
/** Web Home → package `house` glyph */
export const Home = require("lucide-react-native/dist/cjs/icons/house.js")
  .default as LucideIcon
export const Store = require("lucide-react-native/dist/cjs/icons/store.js")
  .default as LucideIcon
export const Fence = require("lucide-react-native/dist/cjs/icons/fence.js")
  .default as LucideIcon
export const Warehouse =
  require("lucide-react-native/dist/cjs/icons/warehouse.js")
    .default as LucideIcon
export const Trees = require("lucide-react-native/dist/cjs/icons/trees.js")
  .default as LucideIcon
export const ChevronLeft =
  require("lucide-react-native/dist/cjs/icons/chevron-left.js")
    .default as LucideIcon
export const ChevronRight =
  require("lucide-react-native/dist/cjs/icons/chevron-right.js")
    .default as LucideIcon
export const MapPin = require("lucide-react-native/dist/cjs/icons/map-pin.js")
  .default as LucideIcon
export const Share2 = require("lucide-react-native/dist/cjs/icons/share-2.js")
  .default as LucideIcon
/* eslint-enable @typescript-eslint/no-require-imports */
