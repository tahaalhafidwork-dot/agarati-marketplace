import { useCallback, useEffect, useState } from "react"
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRouter, type Href } from "expo-router"

import {
  CategoryDirectory,
  type CategoryRow,
} from "../../src/components/CategoryDirectory"
import { PropertyCard } from "../../src/components/PropertyCard"
import { SearchBar } from "../../src/components/SearchBar"
import { SiteHeader } from "../../src/components/SiteHeader"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../src/components/StateViews"
import { homeAccess } from "../../src/data/access"
import type { MobileListingCard } from "../../src/lib/types"
import { font } from "../../src/theme/fonts"
import { colors, spacing, type } from "../../src/theme/tokens"

/** Home — visual parity with web `app/(public)/page.tsx` mobile fold. */
export default function HomeScreen() {
  const router = useRouter()
  const [items, setItems] = useState<MobileListingCard[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const [feed, cats] = await Promise.all([
        homeAccess.featured(),
        homeAccess.categories(),
      ])
      setItems(feed.items.slice(0, 6))
      setCategories(cats)
    } catch (e) {
      setItems([])
      setError(e instanceof Error ? e.message : "تعذّر تحميل الإعلانات")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onSearch = (q: string) => {
    if (!q) router.push("/browse" as Href)
    else router.push(`/browse?q=${encodeURIComponent(q)}` as Href)
  }

  return (
    <View style={styles.root}>
      <SiteHeader />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.searchBlock}>
          <SearchBar onSubmit={onSearch} showAdSlot />
        </View>

        <CategoryDirectory rows={categories} />

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>أحدث الإعلانات</Text>
            <Pressable onPress={() => router.push("/browse" as Href)}>
              <Text style={styles.sectionLink}>تصفح التصنيفات</Text>
            </Pressable>
          </View>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void load()} />
          ) : items.length === 0 ? (
            <EmptyState message="لا إعلانات منشورة بعد." />
          ) : (
            <View style={styles.grid}>
              {items.map((item) => (
                <View key={item.id} style={styles.gridItem}>
                  <PropertyCard item={item} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingBottom: spacing.xxl },
  searchBlock: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: type.base,
    fontFamily: font.semibold,
  },
  sectionLink: {
    color: colors.primary,
    fontSize: type.sm,
    fontFamily: font.medium,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: { width: "48.5%" },
})
