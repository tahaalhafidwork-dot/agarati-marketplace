import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  useFonts,
} from "@expo-google-fonts/cairo"
import type { ReactNode } from "react"

export function useAgaratiFonts() {
  return useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
  })
}

/** Applied when fonts loaded; empty string falls back to system. */
export let font = {
  regular: "Cairo_400Regular",
  medium: "Cairo_500Medium",
  semibold: "Cairo_600SemiBold",
  bold: "Cairo_700Bold",
}

export function FontGate({ children }: { children: ReactNode }) {
  const [loaded, error] = useAgaratiFonts()
  if (!loaded && !error) {
    // Still loading — render children with system fonts so UI is never blank.
    font = {
      regular: "sans-serif",
      medium: "sans-serif-medium",
      semibold: "sans-serif-medium",
      bold: "sans-serif-medium",
    }
  } else if (loaded) {
    font = {
      regular: "Cairo_400Regular",
      medium: "Cairo_500Medium",
      semibold: "Cairo_600SemiBold",
      bold: "Cairo_700Bold",
    }
  } else {
    font = {
      regular: "sans-serif",
      medium: "sans-serif-medium",
      semibold: "sans-serif-medium",
      bold: "sans-serif-medium",
    }
  }
  return <>{children}</>
}
