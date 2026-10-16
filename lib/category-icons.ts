import type { ComponentType } from "react"
import {
  Building2,
  Fence,
  Home,
  Landmark,
  Store,
  Trees,
  Warehouse,
} from "lucide-react"

import type { PropertyCategory } from "@/lib/sample-listings"

export type CategoryIcon = ComponentType<{
  className?: string
  strokeWidth?: number
}>

/** Shared luxury line icons — add-listing wizard + home/menu. */
export const CATEGORY_ICONS: Record<PropertyCategory, CategoryIcon> = {
  apartment: Building2,
  house: Home,
  villa: Landmark,
  office: Store,
  land: Fence,
  building: Warehouse,
  farm: Trees,
}
