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

/** Login — mirrors web LoginForm (email + password). */
export default function LoginScreen() {
  const router = useRouter()
  const { next } = useLocalSearchParams<{ next?: string }>()
  const { signIn, signedIn, ready } = useAuth()
  const [email, setEmail] = useState("")
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
    const res = await signIn(email, password)
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
          <Text style={styles.title}>مرحباً بعودتك</Text>
          <Text style={styles.sub}>دخول بحساب أغاراتي</Text>

          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textAlign="right"
            placeholder="name@example.com"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>كلمة المرور</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
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
              <Text style={styles.btnText}>دخول</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                (next
                  ? `/register?next=${encodeURIComponent(String(next))}`
                  : "/register") as Href
              )
            }
          >
            <Text style={styles.link}>ليس لديك حساب؟ إنشاء حساب</Text>
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
