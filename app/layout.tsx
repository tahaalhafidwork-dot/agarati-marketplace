import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Cairo, Geist, Geist_Mono } from "next/font/google"

import { RegisterServiceWorker } from "@/components/pwa/register-sw"
import { DirectionProvider } from "@/components/ui/direction"
import { ErrorBoundary } from "@/components/ui/error-boundary"

import "./globals.css"

const fontArabic = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "أغاراتي — سوق عقاري",
    template: "%s · أغاراتي",
  },
  description: "سوق عقاري مركّز لتركيا والمنطقة. واجهة عربية وتجربة للجوال أولاً.",
  applicationName: "أغاراتي",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "أغاراتي",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#0F2744",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${fontArabic.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ErrorBoundary>
          <DirectionProvider direction="rtl">
            <RegisterServiceWorker />
            {children}
          </DirectionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
