import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Share2 } from "../../src/icons"
import { type Href, useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuth } from "../../src/auth/AuthProvider"
import { AppSubHeader } from "../../src/components/AppSubHeader"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../src/components/StateViews"
import { favoritesAccess, propertyAccess } from "../../src/data/access"
import { MobileApiError } from "../../src/lib/api"
import { dealLabels } from "../../src/lib/labels"
import type { MobileListingCard } from "../../src/lib/types"
import { font } from "../../src/theme/fonts"
import { colors, radii, spacing, type } from "../../src/theme/tokens"

const width = Dimensions.get("window").width

function toEnglishNumber(value: number): string {
  return String(value)
}

function formatFloorCount(value: number): string {
  if (value === 1) return "طابق واحد"
  if (value === 2) return "طابقان (دوبلكس)"
  if (value === 3) return "3 طوابق (تربلكس)"
  return `${toEnglishNumber(value)} طوابق`
}

function formatBuildingFloorCount(value: number): string {
  return value === 1 ? "طابق واحد" : `${toEnglishNumber(value)} طوابق`
}

/** Property detail — visual parity with web mobile detail. */
export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { signedIn, ready } = useAuth()
  const [result, setResult] = useState<{
    id: string
    item: MobileListingCard | null
    error: string | null
  } | null>(null)
  const requestId = useRef(0)
  const matchesId = result?.id === id
  const item = matchesId ? result.item : null
  const error = matchesId ? result.error : null
  const loading = !ready || !matchesId
  const [imageIndex, setImageIndex] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [favBusy, setFavBusy] = useState(false)

  const fetchProperty = useCallback(async () => {
    if (!id) return { item: null, error: null }
    try {
      const data = await propertyAccess.getById(id)
      return { item: data, error: null }
    } catch (e) {
      return {
        item: null,
        error: e instanceof Error ? e.message : "تعذّر تحميل الإعلان",
      }
    }
  }, [id])

  const requestProperty = useCallback(() => {
    const request = ++requestId.current
    void fetchProperty().then((next) => {
      if (request !== requestId.current) return
      setResult({ id, ...next })
      if (next.item) {
        setFavorited(Boolean(next.item.favorited))
        setImageIndex(0)
      }
    })
  }, [fetchProperty, id])

  useEffect(() => {
    if (!ready || !id) return
    requestProperty()
    return () => {
      requestId.current += 1
    }
  }, [id, ready, requestProperty])

  const retry = () => {
    setResult(null)
    requestProperty()
  }

  const onToggleFavorite = async () => {
    if (!item) return
    if (!signedIn) {
      router.push(
        `/login?next=${encodeURIComponent(`/property/${item.id}`)}` as Href
      )
      return
    }
    setFavBusy(true)
    try {
      const res = await favoritesAccess.toggle(item.id)
      setFavorited(res.favorited)
    } catch (e) {
      const msg =
        e instanceof MobileApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "تعذّر تحديث المفضلة"
      if (e instanceof MobileApiError && e.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`/property/${item.id}`)}` as Href
        )
      } else {
        Alert.alert("المفضلة", msg)
      }
    } finally {
      setFavBusy(false)
    }
  }

  const onShare = async () => {
    if (!item) return
    try {
      await Share.share({
        message: `${item.title} · ${item.price} — أغاراتي`,
      })
    } catch {
      /* ignore */
    }
  }

  if (!ready || loading) {
    return (
      <View style={styles.flex}>
        <LoadingState />
      </View>
    )
  }
  if (error) {
    return (
      <View style={styles.flex}>
        <ErrorState message={error} onRetry={retry} />
      </View>
    )
  }
  if (!item) {
    return (
      <View style={styles.flex}>
        <EmptyState message="الإعلان غير موجود." />
      </View>
    )
  }

  const gallery = item.images.length
    ? item.images
    : item.image
      ? [item.image]
      : []
  const attributes: { label: string; value: string }[] = [
    { label: "السعر", value: item.price },
    { label: "تاريخ الإعلان", value: item.date },
    { label: "رقم الإعلان", value: item.listingNumber },
    {
      label: "نوع العقار",
      value: `${dealLabels[item.deal]} · ${item.type}`,
    },
    { label: "م² (صافي)", value: item.areaM2 },
    ...(item.roomCount != null || item.rooms !== "—"
      ? [{ label: "عدد الغرف", value: item.rooms }]
      : []),
    ...(item.floorNumber != null && item.floor
      ? [{ label: "طابق الوحدة", value: item.floor }]
      : []),
    ...(item.propertyFloors != null
      ? [
          {
            label: "عدد طوابق العقار",
            value: formatFloorCount(item.propertyFloors),
          },
        ]
      : []),
    ...(item.buildingFloors != null
      ? [
          {
            label: "إجمالي طوابق المبنى",
            value: formatBuildingFloorCount(item.buildingFloors),
          },
        ]
      : []),
    { label: "التدفئة", value: item.heating ?? "—" },
    { label: "الأثاث", value: item.furnished ?? "—" },
    { label: "المنطقة", value: item.area },
    {
      label: "الخدمات",
      value:
        item.services && item.services.length > 0
          ? item.services.join(" · ")
          : "—",
    },
  ]

  const method = item.contactMethod ?? "ALL"
  const wa = item.ownerWhatsapp || item.ownerPhone
  const call = item.ownerPhone || item.ownerWhatsapp
  const showWa =
    (method === "WHATSAPP_PHONE" || method === "ALL") && Boolean(wa)
  const showCall =
    (method === "WHATSAPP_PHONE" || method === "ALL") && Boolean(call)

  const openWhatsApp = () => {
    if (!wa) return
    const digits = wa.replace(/[^\d]/g, "")
    const text = encodeURIComponent(
      `مرحباً، بخصوص إعلان أغاراتي: ${item.title}`
    )
    void Linking.openURL(`https://wa.me/${digits}?text=${text}`)
  }
  const openCall = () => {
    if (!call) return
    void Linking.openURL(`tel:${call}`)
  }

  const backHref = `/browse?type=${encodeURIComponent(item.category)}`

  return (
    <View style={styles.flex}>
      <AppSubHeader
        title="تفاصيل الإعلان"
        backHref={backHref}
        right={
          <Pressable onPress={() => void onShare()} hitSlop={8}>
            <Share2 color={colors.headerText} size={16} strokeWidth={1.7} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}>
        {gallery.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / width)
              setImageIndex(i)
            }}
          >
            {gallery.map((uri, i) => (
              <Image
                key={`${uri}-${i}`}
                source={{ uri }}
                alt={`${item.title}، صورة ${i + 1}`}
                style={{ width, height: width * 0.75 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.galleryEmpty, { width, height: width * 0.75 }]}>
            <Text style={styles.muted}>لا صورة</Text>
          </View>
        )}
        {gallery.length > 1 ? (
          <Text style={styles.counter}>
            {imageIndex + 1} / {gallery.length}
          </Text>
        ) : null}

        {item.ownerName ? (
          <View style={styles.ownerStrip}>
            <Text style={styles.ownerStripText}>المعلن: {item.ownerName}</Text>
          </View>
        ) : null}

        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.type}</Text>
              </View>
              <View style={[styles.badge, styles.badgeOutline]}>
                <Text style={styles.badgeText}>{dealLabels[item.deal]}</Text>
              </View>
            </View>
            <Pressable
              style={styles.favBtn}
              onPress={() => void onToggleFavorite()}
              disabled={favBusy}
              accessibilityLabel={
                favorited ? "إزالة من المفضلة" : "إضافة للمفضلة"
              }
            >
              {favBusy ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={[styles.favIcon, favorited && styles.favOn]}>
                  {favorited ? "♥" : "♡"}
                </Text>
              )}
            </Pressable>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.crumb}>
            العقارات › {item.type} › {dealLabels[item.deal]} › {item.area}
          </Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>

        <View style={styles.attrs}>
          {attributes.map((row) => (
            <View key={row.label} style={styles.attrRow}>
              <Text style={styles.attrLabel}>{row.label}</Text>
              <Text style={styles.attrValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.descBlock}>
          <Text style={styles.descTitle}>الوصف</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.contactBar,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        {showCall ? (
          <Pressable
            style={[styles.contactBtn, styles.callBtn]}
            onPress={openCall}
          >
            <Text style={styles.contactBtnText}>اتصال</Text>
          </Pressable>
        ) : null}
        {showWa ? (
          <Pressable
            style={[styles.contactBtn, styles.waBtn]}
            onPress={openWhatsApp}
          >
            <Text style={styles.contactBtnText}>واتساب</Text>
          </Pressable>
        ) : null}
        {!showCall && !showWa ? (
          <Text style={styles.muted}>لا تتوفر بيانات تواصل لهذا الإعلان.</Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.canvas },
  galleryEmpty: {
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    textAlign: "center",
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
    paddingVertical: 4,
  },
  ownerStrip: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(184,149,108,0.25)",
    backgroundColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  ownerStripText: {
    color: colors.primary,
    fontSize: type.sm,
    fontFamily: font.medium,
    textAlign: "right",
  },
  titleBlock: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badges: { flexDirection: "row", gap: 6, flex: 1 },
  badge: {
    backgroundColor: "rgba(228,221,210,0.85)",
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: type.sm,
    fontFamily: font.medium,
    color: colors.primary,
  },
  favBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  favIcon: { fontSize: 26, color: colors.muted },
  favOn: { color: colors.danger },
  title: {
    color: colors.primary,
    fontSize: type.lg,
    fontFamily: font.bold,
    textAlign: "right",
  },
  crumb: {
    color: colors.primary,
    fontSize: type.sm,
    fontFamily: font.regular,
    textAlign: "right",
  },
  price: {
    color: colors.gold,
    fontSize: type.base,
    fontFamily: font.bold,
    textAlign: "right",
    marginTop: 4,
  },
  attrs: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  attrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  attrLabel: {
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
  },
  attrValue: {
    flex: 1,
    color: colors.primary,
    fontSize: type.sm,
    fontFamily: font.semibold,
    textAlign: "left",
  },
  descBlock: { padding: spacing.md, gap: 8 },
  descTitle: {
    color: colors.primary,
    fontSize: type.base,
    fontFamily: font.bold,
  },
  desc: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: font.regular,
    lineHeight: 22,
  },
  contactBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  callBtn: { backgroundColor: colors.primary },
  waBtn: { backgroundColor: "#1f6b4a" },
  contactBtnText: {
    color: colors.headerText,
    fontFamily: font.bold,
    fontSize: type.base,
  },
  muted: {
    color: colors.muted,
    fontSize: type.sm,
    fontFamily: font.regular,
  },
})
