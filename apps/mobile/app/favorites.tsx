import { useCallback, useEffect, useState } from "react"
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { type Href, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../src/auth/AuthProvider"
import { ListingResultRow } from "../src/components/ListingResultRow"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../src/components/StateViews"
import { favoritesAccess } from "../src/data/access"
import type { MobileListingCard } from "../src/lib/types"
import { colors, radii, spacing } from "../src/theme/tokens"

/** Favorites — mirrors web dashboard/favorites listing list (signed-in). */
export default function FavoritesScreen() {
  const router = useRouter()
  const { ready, signedIn } = useAuth()
  const [items, setItems] = useState<MobileListingCard[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (isRefresh = false) => {
      if (!signedIn) {
        setItems([])
        setLoading(false)
        return
      }
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        const res = await favoritesAccess.list()
        setItems(res.items)
      } catch (e) {
        setItems([])
        setError(e instanceof Error ? e.message : "تعذّر تحميل المفضلة")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [signedIn]
  )

  useEffect(() => {
    if (!ready) return
    void load()
  }, [ready, load])

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <LoadingState />
      </SafeAreaView>
    )
  }

  if (!signedIn) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <EmptyState
          message="سجّل الدخول لعرض إعلاناتك المحفوظة."
          actionLabel="دخول"
          onAction={() =>
            router.push("/login?next=/favorites" as Href)
          }
        />
      </SafeAreaView>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <LoadingState />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ErrorState message={error} onRetry={() => void load()} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>الإعلانات المحفوظة</Text>
        <Text style={styles.introSub}>
          {items.length > 0
            ? `${items.length} إعلان`
            : "لا إعلانات محفوظة بعد"}
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            message="لم تحفظ أي إعلان بعد."
            actionLabel="تصفح العقارات"
            onAction={() => router.push("/browse" as Href)}
          />
        }
        renderItem={({ item }) => <ListingResultRow item={item} />}
        ListFooterComponent={
          items.length > 0 ? (
            <Pressable
              style={styles.browseBtn}
              onPress={() => router.push("/browse" as Href)}
            >
              <Text style={styles.browseText}>تصفح العقارات</Text>
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  intro: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  introTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  introSub: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
  },
  list: { paddingBottom: spacing.xl },
  emptyList: { flexGrow: 1 },
  browseBtn: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  browseText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
})
