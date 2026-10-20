import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { type Href, useLocalSearchParams, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../src/auth/AuthProvider"
import { colors, radii, spacing } from "../src/theme/tokens"

/** Register — individual path only (same fields as web individual signup). */
export default function RegisterScreen() {
  const router = useRouter()
  const { next } = useLocalSearchParams<{ next?: string }>()
  const { signUp, signedIn, ready } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dest =
    typeof next === "string" && next.startsWith("/") ? next : "/account"

  useEffect(() => {
    if (ready && signedIn) {
      router.replace(dest as Href)
    }
  }, [ready, signedIn, dest, router])

  if (!ready || signedIn) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  const onSubmit = async () => {
    setPending(true)
    setError(null)
    const res = await signUp({
      name,
      email,
      password,
      phone: phone || undefined,
    })
    setPending(false)
    if (res.error) {
      setError(res.error)
      return
    }
    router.replace(dest as Href)
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>إنشاء حساب</Text>
          <Text style={styles.sub}>مجاني — حساب فردي على أغاراتي</Text>

          <Text style={styles.label}>الاسم</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            textAlign="right"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textAlign="right"
            placeholder="name@example.com"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>الهاتف (اختياري)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign="right"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>كلمة المرور</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="right"
            placeholderTextColor={colors.muted}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.btn, pending && styles.btnDisabled]}
            disabled={pending}
            onPress={() => void onSubmit()}
          >
            {pending ? (
              <ActivityIndicator color={colors.headerText} />
            ) : (
              <Text style={styles.btnText}>إنشاء حساب</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                (next
                  ? `/login?next=${encodeURIComponent(String(next))}`
                  : "/login") as Href
              )
            }
          >
            <Text style={styles.link}>لديك حساب؟ دخول</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.lg,
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.primary,
    fontSize: 14,
  },
  error: { color: colors.danger, fontSize: 13, textAlign: "right" },
  btn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.headerText, fontWeight: "700", fontSize: 15 },
  link: {
    marginTop: spacing.md,
    color: colors.primary,
    textAlign: "center",
    fontSize: 13,
    textDecorationLine: "underline",
  },
})
