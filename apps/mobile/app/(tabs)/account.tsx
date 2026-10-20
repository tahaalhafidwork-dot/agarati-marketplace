import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { type Href, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../../src/auth/AuthProvider"
import { LoadingState } from "../../src/components/StateViews"
import { colors, radii, spacing } from "../../src/theme/tokens"

/** Account — login entry, favorites, logout (mobile chrome "حسابي"). */
export default function AccountScreen() {
  const router = useRouter()
  const { ready, signedIn, user, signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const onLogout = useCallback(async () => {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
  }, [signOut])

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LoadingState />
      </SafeAreaView>
    )
  }

  if (!signedIn) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.brand}>حسابي</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.msg}>سجّل الدخول لإدارة المفضلة وحسابك.</Text>
          <Pressable
            style={styles.btn}
            onPress={() => router.push("/login" as Href)}
          >
            <Text style={styles.btnText}>دخول</Text>
          </Pressable>
          <Pressable
            style={styles.btnOutline}
            onPress={() => router.push("/register" as Href)}
          >
            <Text style={styles.btnOutlineText}>إنشاء حساب</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const email = user?.email ?? ""
  const name =
    (user?.user_metadata?.name as string | undefined) ||
    email.split("@")[0] ||
    "مستخدم"

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.brand}>حسابي</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <Pressable
          style={styles.row}
          onPress={() => router.push("/favorites" as Href)}
        >
          <Text style={styles.rowText}>المفضلة</Text>
          <Text style={styles.chevron}>‹</Text>
        </Pressable>

        <Pressable
          style={[styles.btnOutline, styles.logout]}
          disabled={loggingOut}
          onPress={() => void onLogout()}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.btnOutlineText}>تسجيل الخروج</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brand: {
    color: colors.headerText,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  body: { padding: spacing.lg, gap: spacing.md },
  msg: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginVertical: spacing.lg,
  },
  name: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  email: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "right",
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  rowText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  chevron: { color: colors.muted, fontSize: 22 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: colors.headerText, fontWeight: "700", fontSize: 15 },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnOutlineText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  logout: { marginTop: spacing.xl },
})
