import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
import { Menu, MessageCircle } from "../icons"
import { type Href, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { font } from "../theme/fonts"
import { colors, layout, radii, type } from "../theme/tokens"

/** Mirrors web SiteHeader mobile chrome (h-12 navy + logo mark + icons). */
export function SiteHeader() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.goldLine} />
      <View style={styles.row}>
        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            Alert.alert(
              "القائمة",
              "القائمة الجانبية خارج نطاق M1 — استخدم التصفح من الرئيسية."
            )
          }
          accessibilityLabel="فتح القائمة"
        >
          <Menu color="rgba(248,241,230,0.9)" size={20} strokeWidth={1.7} />
        </Pressable>

        <Pressable
          style={styles.logo}
          onPress={() => router.push("/" as Href)}
        >
          <View style={styles.mark}>
            <Text style={styles.markText}>أ</Text>
          </View>
          <View>
            <Text style={styles.brandAr}>عقاراتي</Text>
            <Text style={styles.brandLat}>AGARATİ</Text>
          </View>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            Alert.alert("الرسائل", "الرسائل خارج نطاق M1.")
          }
          accessibilityLabel="الرسائل"
        >
          <MessageCircle
            color="rgba(248,241,230,0.9)"
            size={16}
            strokeWidth={1.7}
          />
        </Pressable>
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
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mark: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    backgroundColor: "rgba(184,149,108,0.15)",
    borderWidth: 1,
    borderColor: "rgba(184,149,108,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    color: colors.gold,
    fontFamily: font.semibold,
    fontSize: type.sm,
  },
  brandAr: {
    color: colors.headerText,
    fontFamily: font.semibold,
    fontSize: type.base,
    lineHeight: 16,
  },
  brandLat: {
    color: "rgba(248,241,230,0.55)",
    fontFamily: font.medium,
    fontSize: 9.6,
    letterSpacing: 0.4,
    lineHeight: 12,
  },
  spacer: { flex: 1 },
})
