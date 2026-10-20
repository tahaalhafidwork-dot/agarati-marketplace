import { Slot } from "expo-router"
import { StyleSheet, View } from "react-native"

import { BottomNav } from "../../src/components/BottomNav"
import { colors } from "../../src/theme/tokens"

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <Slot />
      </View>
      <BottomNav />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1 },
})
