import type { MetadataRoute } from "next"

/** Web App Manifest — required for installable PWA / TWA (Bubblewrap). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أغاراتي — سوق عقاري",
    short_name: "أغاراتي",
    description: "سوق عقاري مركّز لتركيا والمنطقة. واجهة عربية وتجربة للجوال أولاً.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0F2744",
    theme_color: "#0F2744",
    lang: "ar",
    dir: "rtl",
    categories: ["lifestyle", "business"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
