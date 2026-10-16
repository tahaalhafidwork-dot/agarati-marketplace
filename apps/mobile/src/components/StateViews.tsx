import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

import { font } from "../theme/fonts"
import { colors, radii, spacing, type } from "../theme/tokens"

export function LoadingState({ label = "جاري التحميل…" }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.muted}>{label}</Text>
    </View>
  )
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>إعادة المحاولة</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: font.regular,
  },
  message: {
    color: colors.muted,
    fontSize: type.base,
    fontFamily: font.regular,
    textAlign: "center",
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
    fontSize: type.base,
    fontFamily: font.regular,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.headerText,
    fontFamily: font.semibold,
    fontSize: 13,
  },
})
