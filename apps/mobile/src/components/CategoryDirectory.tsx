import { Pressable, StyleSheet, Text, View } from "react-native"
import {
  Building2,
  ChevronLeft,
  Fence,
  Home,
  Landmark,
  Store,
  Trees,
  Warehouse,
  type LucideIcon,
} from "../icons"
import { type Href, useRouter } from "expo-router"

import type { MobilePropertyCategory } from "../lib/types"
import { font } from "../theme/fonts"
import { colors, layout, radii, type } from "../theme/tokens"

export type CategoryRow = {
  category: MobilePropertyCategory
  label: string
  subtitle: string
  count: string
}

const ICONS: Record<MobilePropertyCategory, LucideIcon> = {
  apartment: Building2,
  house: Home,
  villa: Landmark,
  office: Store,
  land: Fence,
  building: Warehouse,
  farm: Trees,
}

function CategoryIconFrame({ Icon }: { Icon: LucideIcon }) {
  return (
    <View style={styles.iconOuter}>
      <View style={styles.iconShadow} />
      <View style={styles.iconPlate}>
        <View style={styles.iconSheen} />
        <View style={styles.iconFoot} />
        <View style={[styles.tick, styles.tickTL]} />
        <View style={[styles.tick, styles.tickTR]} />
        <View style={[styles.tick, styles.tickBL]} />
        <View style={[styles.tick, styles.tickBR]} />
        <Icon color={colors.gold} size={21.6} strokeWidth={1.55} />
      </View>
    </View>
  )
}

/** Mirrors web `CategoryDirectory` mobile list rows. */
export function CategoryDirectory({ rows }: { rows: CategoryRow[] }) {
  const router = useRouter()

  return (
    <View style={styles.list}>
      {rows.map((row, i) => {
        const Icon = ICONS[row.category]
        return (
          <Pressable
            key={row.category}
            style={[styles.row, i === rows.length - 1 && styles.rowLast]}
            onPress={() =>
              router.push(
                `/browse?type=${encodeURIComponent(row.category)}` as Href
              )
            }
          >
            <CategoryIconFrame Icon={Icon} />
            <View style={styles.textCol}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {row.subtitle}
              </Text>
            </View>
            <Text style={styles.count}>({row.count})</Text>
            <ChevronLeft
              color="rgba(15,39,68,0.35)"
              size={16}
              strokeWidth={1.75}
            />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  textCol: { flex: 1, minWidth: 0 },
  label: {
    fontFamily: font.semibold,
    fontSize: type.md,
    color: colors.primary,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: font.regular,
    fontSize: type.sm,
    color: colors.muted,
  },
  count: {
    fontFamily: font.regular,
    fontSize: type.base,
    color: colors.muted,
    fontVariant: ["tabular-nums"],
  },
  iconOuter: {
    width: layout.categoryIcon,
    height: layout.categoryIcon,
  },
  iconShadow: {
    position: "absolute",
    left: -2,
    right: -2,
    top: 4,
    bottom: 0,
    borderRadius: radii.md,
    backgroundColor: "rgba(15,39,68,0.2)",
  },
  iconPlate: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(184,149,108,0.55)",
    overflow: "hidden",
  },
  iconSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  iconFoot: {
    position: "absolute",
    bottom: 6,
    left: 10,
    right: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(184,149,108,0.5)",
  },
  tick: {
    position: "absolute",
    width: 6,
    height: 6,
    borderColor: "rgba(184,149,108,0.45)",
  },
  tickTL: { top: 6, start: 6, borderTopWidth: 1, borderStartWidth: 1 },
  tickTR: { top: 6, end: 6, borderTopWidth: 1, borderEndWidth: 1 },
  tickBL: {
    bottom: 6,
    start: 6,
    borderBottomWidth: 1,
    borderStartWidth: 1,
    borderColor: "rgba(184,149,108,0.35)",
  },
  tickBR: {
    bottom: 6,
    end: 6,
    borderBottomWidth: 1,
    borderEndWidth: 1,
    borderColor: "rgba(184,149,108,0.35)",
  },
})
