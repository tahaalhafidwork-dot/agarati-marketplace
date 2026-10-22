import type { NextConfig } from "next"

function supabaseImagePatterns() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return []

  try {
    const u = new URL(raw)
    const isLocal = u.hostname === "127.0.0.1" || u.hostname === "localhost"
    const hosts = isLocal ? ["127.0.0.1", "localhost"] : [u.hostname]
    const protocol = (u.protocol.replace(":", "") || "https") as
      | "http"
      | "https"

    return hosts.map((hostname) => ({
      protocol,
      hostname,
      ...(isLocal ? { port: u.port || "54321" } : {}),
      pathname: "/storage/v1/object/public/**" as const,
    }))
  } catch {
    return []
  }
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "live.staticflickr.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        pathname: "/**",
      },
      ...supabaseImagePatterns(),
    ],
  },
}

export default nextConfig
