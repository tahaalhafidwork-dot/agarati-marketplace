import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { type Href, useRouter } from "expo-router"

import { dealLabels } from "../lib/labels"
import type { MobileListingCard } from "../lib/types"
import { font } from "../theme/fonts"
import { colors, radii, spacing, type } from "../theme/tokens"

/** Grid card — web `PropertyCardPlaceholder` mobile grid. */
export function PropertyCard({ item }: { item: MobileListingCard }) {
  const router = useRouter()

  return (
    <Pressable
      style={styles.card}
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
          <Text style={styles.placeholder}>صورة العقار</Text>
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{dealLabels[item.deal]}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.area} numberOfLines={1}>
          {item.area}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.meta} numberOfLines={1}>
          {item.meta}
        </Text>
        {item.date ? <Text style={styles.date}>{item.date}</Text> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
  },
  badge: {
    position: "absolute",
    top: 8,
    start: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.primary,
    fontSize: type.xs,
    fontFamily: font.semibold,
  },
  body: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm, gap: 2 },
  price: {
    color: colors.gold,
    fontSize: type.lg,
    fontFamily: font.bold,
  },
  title: {
    color: colors.primary,
    fontSize: type.base,
    fontFamily: font.medium,
    lineHeight: 20,
  },
  area: {
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: 4,
  },
  meta: {
    flex: 1,
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
  },
  date: {
    color: colors.muted,
    fontSize: 10.4,
    fontFamily: font.regular,
  },
})
