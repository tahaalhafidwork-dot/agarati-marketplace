import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronRight } from "../icons"
import { type Href, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { font } from "../theme/fonts"
import { colors, layout, type } from "../theme/tokens"

/** Mirrors web `AppSubHeader` (mobile-only navy bar). */
export function AppSubHeader({
  title,
  subtitle,
  backHref = "/",
  right,
}: {
  title: string
  subtitle?: string
  backHref?: string
  right?: React.ReactNode
}) {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.goldLine} />
      <View style={styles.row}>
        <Pressable
          style={styles.back}
          onPress={() => router.push(backHref as Href)}
          accessibilityLabel="رجوع"
        >
          <ChevronRight
            color="rgba(248,241,230,0.9)"
            size={18.4}
            strokeWidth={1.6}
          />
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    shadowColor: "#0F2744",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  goldLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(184,149,108,0.55)",
  },
  row: {
    height: layout.headerHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 8,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(184,149,108,0.3)",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  center: { flex: 1, alignItems: "center" },
  title: {
    fontFamily: font.semibold,
    fontSize: type.base,
    color: colors.headerText,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: type.xs,
    color: "rgba(248,241,230,0.55)",
  },
  right: {
    minWidth: 36,
    alignItems: "flex-end",
    justifyContent: "center",
  },
})
