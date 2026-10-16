import { useCallback, useEffect, useState } from "react"
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"

import { AppSubHeader } from "../../src/components/AppSubHeader"
import { ListingResultRow } from "../../src/components/ListingResultRow"
import { SearchBar } from "../../src/components/SearchBar"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../src/components/StateViews"
import { listingsAccess } from "../../src/data/access"
import { categoryMenuLabels, dealLabels } from "../../src/lib/labels"
import type {
  MobileDealType,
  MobileListingCard,
  MobilePropertyCategory,
} from "../../src/lib/types"
import { font } from "../../src/theme/fonts"
import { colors, spacing, type } from "../../src/theme/tokens"

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0]
  return v
}

/** Browse — visual parity with web `PropertiesBrowseView` mobile. */
export default function BrowseScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    q?: string | string[]
    type?: string | string[]
    deal?: string | string[]
  }>()
  const q = asString(params.q) ?? ""
  const type = asString(params.type) as MobilePropertyCategory | undefined
  const deal = asString(params.deal) as MobileDealType | undefined

  const [items, setItems] = useState<MobileListingCard[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = type
    ? (categoryMenuLabels[type] ?? "العقارات")
    : deal
      ? dealLabels[deal]
      : q
        ? `نتائج: ${q}`
        : "كل الإعلانات"

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        const res = await listingsAccess.list({
          q: q || undefined,
          category: type,
          deal,
          sort: "newest",
          page: 1,
          pageSize: 24,
        })
        setItems(res.items)
      } catch (e) {
        setItems([])
        setError(e instanceof Error ? e.message : "تعذّر تحميل النتائج")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [q, type, deal]
  )

  useEffect(() => {
    void load()
  }, [load])

  const onSearch = (next: string) => {
    const qs = new URLSearchParams()
    if (next) qs.set("q", next)
    if (type) qs.set("type", type)
    if (deal) qs.set("deal", deal)
    const s = qs.toString()
    router.replace((s ? `/browse?${s}` : "/browse") as Href)
  }

  return (
    <View style={styles.root}>
      <AppSubHeader
        title={title}
        subtitle={loading ? "…" : `${items.length} إعلان`}
        backHref="/"
      />

      <View style={styles.searchBlock}>
        <SearchBar initialQuery={q} onSubmit={onSearch} showAdSlot={false} />
      </View>

      <View style={styles.crumb}>
        <Pressable onPress={() => router.push("/" as Href)}>
          <Text style={styles.crumbLink}>الرئيسية</Text>
        </Pressable>
        <Text style={styles.crumbSep}> › </Text>
        <Text style={styles.crumbLink}>العقارات</Text>
        {type ? (
          <>
            <Text style={styles.crumbSep}> › </Text>
            <Text style={styles.crumbHere}>
              {categoryMenuLabels[type]}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.crumbSep}> › </Text>
            <Text style={styles.crumbHere}>{title}</Text>
          </>
        )}
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => <ListingResultRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={
            items.length === 0 ? styles.emptyWrap : undefined
          }
          ListEmptyComponent={
            <EmptyState message="لا توجد نتائج مطابقة لبحثك." />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  searchBlock: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  crumb: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: colors.breadcrumbBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  crumbLink: {
    color: colors.primary,
    fontSize: 11.2,
    fontFamily: font.regular,
  },
  crumbSep: {
    color: "rgba(15,39,68,0.6)",
    fontSize: 11.2,
    marginHorizontal: 2,
  },
  crumbHere: {
    color: colors.primary,
    fontSize: 11.2,
    fontFamily: font.medium,
  },
  list: { backgroundColor: "rgba(243,235,224,0.5)" },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  emptyWrap: { flexGrow: 1 },
})
