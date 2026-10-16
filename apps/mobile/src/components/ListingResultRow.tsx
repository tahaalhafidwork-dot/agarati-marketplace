import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { MapPin } from "../icons"
import { type Href, useRouter } from "expo-router"

import { dealLabels } from "../lib/labels"
import type { MobileListingCard } from "../lib/types"
import { font } from "../theme/fonts"
import { colors, layout, spacing, type } from "../theme/tokens"

/** List row — web `ListingResultRow` mobile. */
export function ListingResultRow({ item }: { item: MobileListingCard }) {
  const router = useRouter()

  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push(`/property/${item.id}` as Href)}
    >
      <View style={styles.thumb}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.placeholder}>—</Text>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.number} numberOfLines={1}>
            #{item.listingNumber}
          </Text>
        </View>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{dealLabels[item.deal]}</Text>
          </View>
          <View style={[styles.badge, styles.badgeOutline]}>
            <Text style={styles.badgeText}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.areaRow}>
          <MapPin color={colors.muted} size={12} strokeWidth={1.75} />
          <Text style={styles.area} numberOfLines={1}>
            {item.area}
          </Text>
        </View>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.rowBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  thumb: {
    width: layout.listingThumb,
    height: layout.listingThumb,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    color: colors.primary,
    fontSize: type.base,
    fontFamily: font.bold,
    lineHeight: 20,
  },
  number: {
    color: colors.muted,
    fontSize: type.xs,
    fontFamily: font.regular,
    fontVariant: ["tabular-nums"],
  },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  badge: {
    backgroundColor: "rgba(228,221,210,0.85)",
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.primary,
    fontSize: type.xs,
    fontFamily: font.medium,
  },
  areaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  area: {
    flex: 1,
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
  },
  price: {
    marginTop: 4,
    textAlign: "left",
    color: colors.gold,
    fontSize: type.base,
    fontFamily: font.bold,
  },
})
