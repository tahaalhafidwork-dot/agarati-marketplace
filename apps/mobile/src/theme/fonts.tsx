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

/** Registered by `useAgaratiFonts`; kept immutable for module-level styles. */
export const font = {
  regular: "Cairo_400Regular",
  medium: "Cairo_500Medium",
  semibold: "Cairo_600SemiBold",
  bold: "Cairo_700Bold",
} as const

export function FontGate({ children }: { children: ReactNode }) {
  const [loaded, error] = useAgaratiFonts()

  if (!loaded && !error) return null

  // On failure, render with the platform's native fallback rather than
  // keeping the application blank. Successful loads keep the Cairo families.
  return <>{children}</>
}
