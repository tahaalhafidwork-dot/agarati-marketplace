import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
import {
  Building2,
  Landmark,
  Plus,
  Sparkles,
  UserRound,
} from "../icons"
import { type Href, usePathname, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuth } from "../auth/AuthProvider"
import { font } from "../theme/fonts"
import { colors, layout, type } from "../theme/tokens"

/**
 * Pixel-aligned to web `MobileBottomNav` + `mobileBottomTabsSurface`.
 * Tabs: Agarly · مشاريع · أضف إعلاناً (FAB) · خدمات · حسابي
 */
export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const { signedIn } = useAuth()

  const soon = (label: string) =>
    Alert.alert(label, "هذه الشاشة خارج نطاق M1 حالياً.")

  const onAccount =
    pathname.includes("/account") ||
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/favorites")

  const tabs: {
    id: string
    label: string
    primary?: boolean
    account?: boolean
    active?: boolean
    onPress: () => void
    Icon: typeof Sparkles
  }[] = [
    {
      id: "agarly",
      label: "Agarly",
      Icon: Sparkles,
      onPress: () => soon("Agarly"),
    },
    {
      id: "projects",
      label: "مشاريع",
      Icon: Landmark,
      onPress: () => soon("مشاريع"),
    },
    {
      id: "addListing",
      label: "أضف إعلاناً",
      primary: true,
      Icon: Plus,
      onPress: () => soon("أضف إعلاناً"),
    },
    {
      id: "services",
      label: "خدمات",
      Icon: Building2,
      onPress: () => soon("خدمات"),
    },
    {
      id: "account",
      label: "حسابي",
      account: true,
      active: onAccount,
      Icon: UserRound,
      onPress: () => {
        if (signedIn) router.push("/account" as Href)
        else router.push("/login?next=/account" as Href)
      },
    },
  ]

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 0) },
      ]}
    >
      <View style={styles.goldLine} />
      <View style={styles.row}>
        {tabs.map((tab) => {
          if (tab.primary) {
            return (
              <View key={tab.id} style={styles.item}>
                <Pressable style={styles.fabWrap} onPress={tab.onPress}>
                  <View style={styles.fab}>
                    <View style={styles.fabSheen} />
                    <Plus
                      color={colors.gold}
                      size={20}
                      strokeWidth={1.75}
                    />
                  </View>
                  <Text style={styles.fabLabel}>{tab.label}</Text>
                </Pressable>
              </View>
            )
          }
          const active = Boolean(tab.active)
          const Icon = tab.Icon
          return (
            <Pressable key={tab.id} style={styles.item} onPress={tab.onPress}>
              <Icon
                color={active ? colors.gold : colors.muted}
                size={19.2}
                strokeWidth={active ? 1.85 : 1.6}
              />
              <Text style={[styles.label, active && styles.labelActive]}>
                {tab.label}
              </Text>
              <View style={[styles.dot, active && styles.dotOn]} />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    borderTopColor: "rgba(15,39,68,0.08)",
    backgroundColor: colors.navBg,
    shadowColor: "#0F2744",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12,
  },
  goldLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(184,149,108,0.5)",
    marginHorizontal: 24,
  },
  row: {
    height: layout.bottomNavHeight,
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontFamily: font.medium,
    fontSize: type.xs,
    color: colors.muted,
  },
  labelActive: {
    fontFamily: font.semibold,
    color: colors.primary,
  },
  dot: { height: 2, width: 16, marginTop: 2 },
  dotOn: {
    backgroundColor: "rgba(184,149,108,0.7)",
    borderRadius: 999,
  },
  fabWrap: {
    alignItems: "center",
    marginTop: -10,
  },
  fab: {
    width: layout.fabSize,
    height: layout.fabSize,
    borderRadius: layout.fabSize / 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(184,149,108,0.55)",
    overflow: "hidden",
  },
  fabSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  fabLabel: {
    marginTop: 2,
    fontFamily: font.medium,
    fontSize: type.xs,
    color: "rgba(15,39,68,0.75)",
  },
})
