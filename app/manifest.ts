import type { MetadataRoute } from "next"

/** Web App Manifest — required for installable PWA / TWA (Bubblewrap). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أغاراتي — سوق عقاري",
    short_name: "أغاراتي",
    description: "منصة عقارية عراقية متخصصة للعقارات والمشاريع والوكالات المعتمدة، بتجربة عربية تبدأ من الهاتف.",
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
