import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { I18nManager } from "react-native"

import { AuthProvider } from "../src/auth/AuthProvider"
import { FontGate } from "../src/theme/fonts"
import { colors } from "../src/theme/tokens"

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true)
  I18nManager.forceRTL(true)
}

export default function RootLayout() {
  return (
    <FontGate>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.headerText,
            headerTitleStyle: { fontWeight: "600" },
            contentStyle: { backgroundColor: colors.canvas },
            headerBackTitle: "رجوع",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="property/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="login" options={{ title: "تسجيل الدخول" }} />
          <Stack.Screen name="register" options={{ title: "إنشاء حساب" }} />
          <Stack.Screen name="favorites" options={{ title: "المفضلة" }} />
        </Stack>
      </AuthProvider>
    </FontGate>
  )
}
