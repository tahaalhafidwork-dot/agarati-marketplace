import { useState } from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { Search, X } from "../icons"

import { font } from "../theme/fonts"
import { colors, layout, radii, spacing, type } from "../theme/tokens"

/** Mirrors web `HomeSearchBar` (rounded shell + circular Search FAB + ad slot). */
export function SearchBar({
  initialQuery = "",
  onSubmit,
  placeholder = "ابحث برقم الإعلان أو بكلمات من العنوان…",
  showAdSlot = true,
}: {
  initialQuery?: string
  onSubmit: (query: string) => void
  placeholder?: string
  showAdSlot?: boolean
}) {
  const [query, setQuery] = useState(initialQuery)

  return (
    <View>
      <View style={styles.shell}>
        <View style={styles.field}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor="rgba(107,101,96,0.75)"
            style={styles.input}
            returnKeyType="search"
            textAlign="right"
            onSubmitEditing={() => onSubmit(query.trim())}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query ? (
            <Pressable
              onPress={() => setQuery("")}
              style={styles.clear}
              accessibilityLabel="مسح"
            >
              <X color={colors.muted} size={14} strokeWidth={1.75} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={styles.searchBtn}
          onPress={() => onSubmit(query.trim())}
          accessibilityLabel="بحث"
        >
          <View style={styles.searchSheen} />
          <Search color={colors.gold} size={20} strokeWidth={1.75} />
        </Pressable>
      </View>
      {showAdSlot ? (
        <View style={styles.adSlot} accessibilityLabel="مساحة إعلانية">
          <Text style={styles.adText}>مساحة إعلانية · قريباً</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii["2xl"],
    borderWidth: 1,
    borderColor: "rgba(228,221,210,0.7)",
    backgroundColor: colors.surface,
    padding: 6,
    shadowColor: "#0F2744",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radii.xl,
    backgroundColor: "rgba(246,243,238,0.7)",
    paddingHorizontal: spacing.md,
    minHeight: layout.searchInputH,
  },
  input: {
    flex: 1,
    fontSize: type.base,
    fontFamily: font.regular,
    color: colors.primary,
    paddingVertical: 8,
  },
  clear: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtn: {
    width: layout.searchInputH,
    height: layout.searchInputH,
    borderRadius: layout.searchInputH / 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(184,149,108,0.55)",
    overflow: "hidden",
  },
  searchSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  adSlot: {
    marginTop: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(228,221,210,0.8)",
    backgroundColor: "rgba(107,101,96,0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  adText: {
    fontFamily: font.regular,
    fontSize: type.xs,
    color: "rgba(107,101,96,0.8)",
    textAlign: "center",
  },
})
